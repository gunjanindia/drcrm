import { NextResponse } from 'next/server';
import { runDigitalPresenceAudit } from '@/lib/audit-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, googleMapsUrl, websiteUrl, category } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const audit = runDigitalPresenceAudit(businessName, googleMapsUrl, websiteUrl, category);
    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate presence audit' }, { status: 500 });
  }
}
