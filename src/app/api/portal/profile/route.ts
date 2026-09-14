import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import {
  SyncedBusinessProfile,
  DEMO_BUSINESS_PROFILE,
  generateDynamicReviewsForBusiness,
  generateDynamicGrowthForBusiness,
  generateDynamicAuditFactorsForBusiness,
} from '@/lib/client-portal-sync';
import { DEFAULT_MINI_SITE } from '@/lib/client-360-data';

export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        data: DEMO_BUSINESS_PROFILE,
        message: 'No active session, returning demo profile',
      });
    }

    let clientRecord: any = null;

    // 1. Fetch from Prisma Database if configured
    if (process.env.DATABASE_URL) {
      try {
        if (session.clientId) {
          clientRecord = await prisma.client.findUnique({
            where: { id: session.clientId },
          });
        }

        if (!clientRecord && session.email) {
          clientRecord = await prisma.client.findFirst({
            where: {
              OR: [
                { email: session.email.toLowerCase() },
                { phone: { contains: session.email.replace(/[^0-9]/g, '').slice(-10) } },
              ],
            },
          });
        }
      } catch (dbErr) {
        console.error('Failed to fetch client from Prisma DB:', dbErr);
      }
    }

    // 2. Fallback to globalStore
    if (!clientRecord) {
      if (session.clientId) {
        clientRecord = globalStore.clients.find((c) => c.id === session.clientId);
      }
      if (!clientRecord && session.email) {
        const cleanEmail = session.email.toLowerCase();
        const digits = cleanEmail.replace(/[^0-9]/g, '');
        clientRecord = globalStore.clients.find(
          (c) =>
            c.email.toLowerCase() === cleanEmail ||
            (digits.length >= 10 && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(digits.slice(-10)))
        );
      }
    }

    // 3. If staff member viewing without specific client, use first client
    if (!clientRecord && session.role !== 'CLIENT') {
      clientRecord = globalStore.clients[0] || null;
    }

    if (!clientRecord) {
      return NextResponse.json({
        authenticated: true,
        data: DEMO_BUSINESS_PROFILE,
        message: 'Client record not found, using baseline profile',
      });
    }

    // 4. Construct SyncedBusinessProfile purely from stored database records (Zero Google API calls)
    const rating = typeof clientRecord.averageRating === 'number' ? clientRecord.averageRating : 4.8;
    const reviewCount = typeof clientRecord.reviewCount === 'number' ? clientRecord.reviewCount : 24;
    const gbpScore = typeof clientRecord.gbpScore === 'number' ? clientRecord.gbpScore : 82;
    const photosCount = 15;

    const profile: SyncedBusinessProfile = {
      isLiveSynced: true,
      businessName: clientRecord.businessName,
      category: clientRecord.category || 'Local Business',
      city: clientRecord.city || 'Ranchi',
      address: clientRecord.address || `${clientRecord.city || 'Ranchi'}, Jharkhand`,
      phone: clientRecord.phone || '+91 94311 09876',
      whatsapp: (clientRecord.whatsapp || clientRecord.phone || '+91 94311 09876').replace(/[^0-9]/g, ''),
      email: clientRecord.email || session.email,
      googleMapsUrl: clientRecord.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(clientRecord.businessName)}`,
      placeId: `loc_${clientRecord.id}`,
      averageRating: rating,
      reviewCount: reviewCount,
      photosCount: photosCount,
      gbpScore: gbpScore,
      packageName: clientRecord.packageName || 'Growth Retainer Plan',
      monthlyRevenue: clientRecord.monthlyRevenue || 2499,
      renewalDate: clientRecord.renewalDate
        ? new Date(clientRecord.renewalDate).toISOString()
        : new Date(Date.now() + 20 * 86400000).toISOString(),
      googleOwnerEmail: session.email || clientRecord.email,
      googleAccountName: `${clientRecord.businessName} (Verified Owner)`,
      syncedAt: 'Stored in CRM Database',
      isOperational: true,
      reviews: generateDynamicReviewsForBusiness(clientRecord.businessName, clientRecord.category, clientRecord.city, rating),
      growthMetrics: generateDynamicGrowthForBusiness(reviewCount, rating),
      auditFactors: generateDynamicAuditFactorsForBusiness(
        clientRecord.businessName,
        clientRecord.category,
        clientRecord.city,
        rating,
        reviewCount,
        photosCount
      ),
      miniSiteConfig: {
        ...DEFAULT_MINI_SITE,
        headline: clientRecord.businessName,
        subheadline: `Verified ${clientRecord.category} in ${clientRecord.city}`,
        address: clientRecord.address,
        phone: clientRecord.phone,
        whatsapp: (clientRecord.whatsapp || clientRecord.phone).replace(/[^0-9]/g, ''),
        customSlug: clientRecord.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session,
      data: profile,
      source: 'DATABASE_STORED_RECORDS',
    });
  } catch (error: any) {
    console.error('GET /api/portal/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch portal profile' }, { status: 500 });
  }
}
