import { NextResponse } from 'next/server';
import { runDigitalPresenceAudit } from '@/lib/audit-engine';
import { globalStore } from '@/lib/store';
import { checkRateLimit } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // 1. IP and Client Rate Limiting (Strict 3 audits per IP / 24 hours)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const clientIp = (cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp)) || '127.0.0.1';

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

    // A. Honeypot check: Bots automatically fill hidden fields
    if (hp_field && hp_field.trim().length > 0) {
      console.warn(`[Anti-Spam] Honeypot triggered by IP ${clientIp}. Rejecting automated submission.`);
      return NextResponse.json(
        { error: 'Automated submission rejected. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // B. Velocity check: Reject submissions faster than 1 second (bot script behavior)
    if (formLoadedAt) {
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

    // C. Phone validation & phone-based rate limiting (Max 3 scans per phone / 24 hours)
    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { error: 'Please provide a valid 10-digit mobile number for report delivery.' },
          { status: 400 }
        );
      }

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

    // 4. Auto-register / Upsert Lead in PostgreSQL CRM Database
    if (cleanPhone) {
      const normalizedDigits = cleanPhone.replace(/[^0-9]/g, '').slice(-10);
      const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${normalizedDigits}`;
      const contactPerson = contactName?.trim() || audit.businessName;
      const cleanEmail = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}@lead.digitalranchi.in`;
      const noteContent = `Captured via Free Presence Audit. Score: ${audit.overallScore}/100. Google Rating: ${audit.averageRating || 'N/A'}★ (${audit.reviewCount || 0} reviews). Status: ${audit.validationStatus}. Recommended: ${audit.suggestedPackage.name}.`;

      // A. Neon PostgreSQL Prisma persistence
      if (process.env.DATABASE_URL) {
        try {
          // Ensure default tenant exists
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

          // Check if lead already exists with this phone
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
                interestedPackageId: audit.suggestedPackage.id,
                estimatedValue: audit.suggestedPackage.price,
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
                leadSource: 'Website Free Audit',
                leadScore: audit.overallScore,
                auditScore: audit.overallScore,
                interestedPackageId: audit.suggestedPackage.id,
                estimatedValue: audit.suggestedPackage.price,
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
          existingStoreLead.interestedPackageId = audit.suggestedPackage.id;
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
            leadSource: 'Website Free Audit',
            leadScore: audit.overallScore,
            auditScore: audit.overallScore,
            interestedPackageId: audit.suggestedPackage.id,
            estimatedValue: audit.suggestedPackage.price,
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
      remainingAudits: ipLimit.remaining,
      resetMessage: ipLimit.resetMessage,
    });
  } catch (error: any) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate presence audit' },
      { status: 500 }
    );
  }
}

