import { NextResponse } from 'next/server';
import { runDigitalPresenceAudit } from '@/lib/audit-engine';
import { globalStore } from '@/lib/store';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    // 1. IP-Based Rate Limiting (Max 5 audits per IP / hour)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    const rateLimit = checkRateLimit(clientIp, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Audit limit reached. You can run up to 5 scans per hour. Please try again in ${rateLimit.resetMinutes} minutes or contact Digital Ranchi sales.`,
          isRateLimited: true,
          resetMinutes: rateLimit.resetMinutes,
        },
        { status: 429 }
      );
    }

    // 2. Parse payload
    const body = await request.json();
    const { businessName, googleMapsUrl, websiteUrl, category, city, phone, contactName, selectedPlaceId } = body;

    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    // 3. Execute presence audit
    const audit = await runDigitalPresenceAudit(
      businessName,
      googleMapsUrl,
      websiteUrl,
      category || 'Local Business',
      city || 'Ranchi',
      selectedPlaceId
    );

    // 4. Auto-register lead in CRM when contact details are provided
    if (phone && phone.trim()) {
      try {
        const cleanPhone = phone.trim();
        const existingLead = globalStore.leads.find((l) => l.phone === cleanPhone);

        if (existingLead) {
          // Update existing lead with fresh audit score
          existingLead.auditScore = audit.overallScore;
          existingLead.leadScore = audit.overallScore;
          existingLead.interestedPackageId = audit.suggestedPackage.id;
          existingLead.notes = `${existingLead.notes || ''} | Re-audited on ${new Date().toLocaleDateString()}: Score ${audit.overallScore}/100 (${audit.validationStatus}).`;
          globalStore.saveToFile();
        } else {
          // Create new lead in CRM
          globalStore.createLead({
            businessName: audit.businessName,
            contactName: contactName?.trim() || audit.businessName,
            phone: cleanPhone,
            whatsapp: cleanPhone,
            email: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@lead.digitalranchi.in`,
            category: category || 'Local Business',
            city: city || 'Ranchi',
            state: 'Jharkhand',
            googleMapsUrl: audit.matchedPlace?.googleMapsUrl || googleMapsUrl,
            websiteUrl,
            leadSource: 'Website Free Audit',
            leadScore: audit.overallScore,
            auditScore: audit.overallScore,
            interestedPackageId: audit.suggestedPackage.id,
            estimatedValue: audit.suggestedPackage.price,
            status: 'AUDIT',
            notes: `Auto-captured from Free Presence Audit. Rating: ${audit.matchedPlace?.rating || 'N/A'}★. Status: ${audit.validationStatus}. Recommended: ${audit.suggestedPackage.name}.`,
          });
        }
      } catch (err) {
        console.error('Failed to auto-save audit lead:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: audit,
      remainingAudits: rateLimit.remaining,
    });
  } catch (error: any) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate presence audit' },
      { status: 500 }
    );
  }
}
