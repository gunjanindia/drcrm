import { NextResponse } from 'next/server';
import { runDigitalPresenceAudit } from '@/lib/audit-engine';
import { globalStore } from '@/lib/store';
import { checkRateLimit } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { getCurrentUserSession } from '@/lib/auth';

// GET: Retrieve tracked audit records history (for staff members)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let records = globalStore.auditRecords;

    if (search) {
      records = records.filter(
        (r) =>
          r.businessName.toLowerCase().includes(search) ||
          r.city.toLowerCase().includes(search) ||
          (r.phone && r.phone.includes(search)) ||
          (r.auditedByUserName && r.auditedByUserName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      data: records,
      totalCount: globalStore.auditRecords.length,
    });
  } catch (error: any) {
    console.error('Fetch audit history error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch audit history' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an audit record from history
export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Audit record ID is required' }, { status: 400 });
    }

    const deleted = globalStore.deleteAuditRecord(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Delete audit record error:', error);
    return NextResponse.json({ error: 'Failed to delete audit record' }, { status: 500 });
  }
}

// POST: Execute Digital Presence Audit (Unrestricted for staff, rate-limited for public)
export async function POST(request: Request) {
  try {
    // 0. Check authenticated staff session
    const session = await getCurrentUserSession();
    const isStaff = !!(session && session.role && session.role !== 'CLIENT');

    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const clientIp = (cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp)) || '127.0.0.1';

    // 1. IP Rate Limiting (Skipped for staff members)
    let remainingAudits = 999;
    let resetMessage = undefined;

    if (!isStaff) {
      const ipLimit = checkRateLimit(`ip_${clientIp}`, 3, 24 * 60 * 60 * 1000);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          {
            error: ipLimit.resetMessage || 'Daily audit limit reached (3 scans per day). Please try again tomorrow or contact Digital Ranchi sales on WhatsApp.',
            isRateLimited: true,
            resetHours: ipLimit.resetHours,
            resetMinutes: ipLimit.resetMinutes,
          },
          { status: 429 }
        );
      }
      remainingAudits = ipLimit.remaining;
      resetMessage = ipLimit.resetMessage;
    }

    // 2. Parse payload & anti-spam protections
    const body = await request.json();
    const {
      businessName,
      googleMapsUrl,
      websiteUrl,
      category,
      city,
      phone,
      contactName,
      selectedPlaceId,
      hp_field,        // Honeypot field (should be blank)
      formLoadedAt,    // Timestamp when form was loaded in browser
    } = body;

    // A. Honeypot check (Skipped for authenticated staff)
    if (!isStaff && hp_field && hp_field.trim().length > 0) {
      console.warn(`[Anti-Spam] Honeypot triggered by IP ${clientIp}. Rejecting automated submission.`);
      return NextResponse.json(
        { error: 'Automated submission rejected. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // B. Velocity check (Skipped for authenticated staff)
    if (!isStaff && formLoadedAt) {
      const durationMs = Date.now() - Number(formLoadedAt);
      if (durationMs > 0 && durationMs < 1000) {
        console.warn(`[Anti-Spam] Fast submission detected (${durationMs}ms) by IP ${clientIp}. Rejecting.`);
        return NextResponse.json(
          { error: 'Submission received too fast. Please submit naturally.' },
          { status: 400 }
        );
      }
    }

    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const cleanPhone = (phone || '').trim().replace(/[^0-9+]/g, '');

    // C. Phone validation & phone-based rate limiting (Skipped for staff)
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 10 && !isStaff) {
        return NextResponse.json(
          { error: 'Please provide a valid 10-digit mobile number for report delivery.' },
          { status: 400 }
        );
      }

      if (!isStaff) {
        // Rate limit by normalized phone number
        const phoneLimit = checkRateLimit(`phone_${digitsOnly.slice(-10)}`, 3, 24 * 60 * 60 * 1000);
        if (!phoneLimit.allowed) {
          return NextResponse.json(
            {
              error: `Daily limit reached for phone ${cleanPhone} (${phoneLimit.resetMessage})`,
              isRateLimited: true,
              resetHours: phoneLimit.resetHours,
              resetMinutes: phoneLimit.resetMinutes,
            },
            { status: 429 }
          );
        }
      }
    }

    // 3. Execute presence audit
    const audit = await runDigitalPresenceAudit(
      businessName.trim(),
      googleMapsUrl ? googleMapsUrl.trim() : undefined,
      websiteUrl ? websiteUrl.trim() : undefined,
      category ? category.trim() : 'Local Business',
      city ? city.trim() : 'Ranchi',
      selectedPlaceId
    );

    // Attach contact details to audit result
    audit.contactName = contactName?.trim() || undefined;
    audit.phone = cleanPhone || undefined;

    // 4. Track and persist in Audit Log
    try {
      globalStore.createAuditRecord({
        businessName: audit.businessName,
        contactName: audit.contactName,
        phone: audit.phone,
        city: audit.city || city || 'Ranchi',
        category: category?.trim() || 'Local Business',
        googleMapsUrl: audit.matchedPlace?.googleMapsUrl || googleMapsUrl,
        websiteUrl: websiteUrl,
        placeId: audit.matchedPlace?.placeId || selectedPlaceId,
        overallScore: audit.overallScore,
        averageRating: audit.averageRating,
        reviewCount: audit.reviewCount,
        validationStatus: audit.validationStatus,
        suggestedPackageId: audit.suggestedPackage?.id,
        suggestedPackageName: audit.suggestedPackage?.name,
        suggestedPackagePrice: audit.suggestedPackage?.price,
        breakdown: audit.breakdown,
        strengths: audit.strengths,
        criticalWeaknesses: audit.criticalWeaknesses,
        recommendedImprovements: audit.recommendedImprovements,
        matchedPlace: audit.matchedPlace,
        candidates: audit.candidates,
        auditedByUserId: session?.userId,
        auditedByUserName: session?.name || (isStaff ? 'Staff Member' : 'Website Visitor'),
        isStaffAudit: isStaff,
      });
    } catch (logErr) {
      console.error('Failed to log audit record:', logErr);
    }

    // 5. Auto-register / Upsert Lead in PostgreSQL CRM Database
    if (cleanPhone) {
      const normalizedDigits = cleanPhone.replace(/[^0-9]/g, '').slice(-10);
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${normalizedDigits}`;
      const contactPerson = contactName?.trim() || audit.businessName;
      const cleanEmail = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}@lead.digitalranchi.in`;
      const noteContent = `Presence Audit. Score: ${audit.overallScore}/100. Google Rating: ${audit.averageRating || 'N/A'}★ (${audit.reviewCount || 0} reviews). Status: ${audit.validationStatus}. Scanned by: ${session?.name || (isStaff ? 'Staff' : 'Public')}.`;

      // A. Neon PostgreSQL Prisma persistence
      if (process.env.DATABASE_URL) {
        try {
          const tenant = await prisma.tenant.upsert({
            where: { domain: 'digitalranchi.in' },
            update: {},
            create: {
              id: 'tenant_main',
              name: 'Digital Ranchi',
              domain: 'digitalranchi.in',
              isActive: true,
            },
          });

          const existingDbLead = await prisma.lead.findFirst({
            where: {
              OR: [
                { phone: { contains: normalizedDigits } },
                { whatsapp: { contains: normalizedDigits } },
              ],
            },
          });

          if (existingDbLead) {
            await prisma.lead.update({
              where: { id: existingDbLead.id },
              data: {
                businessName: audit.businessName,
                contactName: contactPerson,
                auditScore: audit.overallScore,
                leadScore: audit.overallScore,
                interestedPackageId: audit.suggestedPackage?.id,
                estimatedValue: audit.suggestedPackage?.price || 999,
                googleMapsUrl: audit.matchedPlace?.googleMapsUrl || googleMapsUrl || existingDbLead.googleMapsUrl,
                websiteUrl: websiteUrl || existingDbLead.websiteUrl,
                notes: `${existingDbLead.notes || ''}\n[Re-Audited ${new Date().toLocaleDateString()}]: ${noteContent}`,
              },
            });
          } else {
            await prisma.lead.create({
              data: {
                tenantId: tenant.id,
                businessName: audit.businessName,
                contactName: contactPerson,
                phone: formattedPhone,
                whatsapp: formattedPhone,
                email: cleanEmail,
                category: category?.trim() || 'Local Business',
                city: city?.trim() || 'Ranchi',
                state: 'Jharkhand',
                googleMapsUrl: audit.matchedPlace?.googleMapsUrl || googleMapsUrl || null,
                websiteUrl: websiteUrl || null,
                leadSource: isStaff ? 'Staff GBP Audit Scanner' : 'Website Free Audit',
                leadScore: audit.overallScore,
                auditScore: audit.overallScore,
                interestedPackageId: audit.suggestedPackage?.id,
                estimatedValue: audit.suggestedPackage?.price || 999,
                status: 'AUDIT',
                notes: noteContent,
              },
            });
          }
        } catch (dbErr) {
          console.error('Database lead save error:', dbErr);
        }
      }

      // B. Memory store persistence & sync
      try {
        const existingStoreLead = globalStore.leads.find(
          (l) => l.phone.includes(normalizedDigits) || l.whatsapp.includes(normalizedDigits)
        );

        if (existingStoreLead) {
          existingStoreLead.businessName = audit.businessName;
          existingStoreLead.contactName = contactPerson;
          existingStoreLead.auditScore = audit.overallScore;
          existingStoreLead.leadScore = audit.overallScore;
          existingStoreLead.interestedPackageId = audit.suggestedPackage?.id;
          existingStoreLead.notes = `${existingStoreLead.notes || ''} | ${noteContent}`;
          globalStore.saveToFile();
        } else {
          await globalStore.createLead({
            businessName: audit.businessName,
            contactName: contactPerson,
            phone: formattedPhone,
            whatsapp: formattedPhone,
            email: cleanEmail,
            category: category?.trim() || 'Local Business',
            city: city?.trim() || 'Ranchi',
            state: 'Jharkhand',
            googleMapsUrl: audit.matchedPlace?.googleMapsUrl || googleMapsUrl,
            websiteUrl,
            leadSource: isStaff ? 'Staff GBP Audit Scanner' : 'Website Free Audit',
            leadScore: audit.overallScore,
            auditScore: audit.overallScore,
            interestedPackageId: audit.suggestedPackage?.id,
            estimatedValue: audit.suggestedPackage?.price || 999,
            status: 'AUDIT',
            notes: noteContent,
          });
        }
      } catch (storeErr) {
        console.error('Store lead save error:', storeErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: audit,
      isStaff,
      remainingAudits: isStaff ? 999 : remainingAudits,
      resetMessage: isStaff ? 'Unrestricted Staff Mode (No daily limits)' : resetMessage,
    });
  } catch (error: any) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate presence audit' },
      { status: 500 }
    );
  }
}

