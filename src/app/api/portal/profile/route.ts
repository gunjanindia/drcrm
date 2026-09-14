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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');
    const session = await getCurrentUserSession();

    let clientRecord: any = null;

    // 1. If explicit clientId requested (e.g. from Admin 360 preview or specific portal link)
    if (requestedClientId) {
      if (process.env.DATABASE_URL) {
        try {
          clientRecord = await prisma.client.findUnique({
            where: { id: requestedClientId },
          });
        } catch (e) {
          console.error('Error fetching requested clientId from Prisma:', e);
        }
      }
      if (!clientRecord) {
        clientRecord = globalStore.clients.find((c) => c.id === requestedClientId);
      }
    }

    // 2. Fetch based on authenticated user session if not explicitly requested
    if (!clientRecord && session) {
      if (session.clientId) {
        if (process.env.DATABASE_URL) {
          try {
            clientRecord = await prisma.client.findUnique({
              where: { id: session.clientId },
            });
          } catch (e) {
            console.error('Error fetching session clientId from Prisma:', e);
          }
        }
        if (!clientRecord) {
          clientRecord = globalStore.clients.find((c) => c.id === session.clientId);
        }
      }

      if (!clientRecord && session.email) {
        const cleanEmail = session.email.toLowerCase();
        const digits = cleanEmail.replace(/[^0-9]/g, '');
        if (process.env.DATABASE_URL) {
          try {
            clientRecord = await prisma.client.findFirst({
              where: {
                OR: [
                  { email: cleanEmail },
                  ...(digits.length >= 10 ? [{ phone: { contains: digits.slice(-10) } }] : []),
                ],
              },
            });
          } catch (e) {
            console.error('Error fetching client by session email from Prisma:', e);
          }
        }
        if (!clientRecord) {
          clientRecord = globalStore.clients.find(
            (c) =>
              c.email.toLowerCase() === cleanEmail ||
              (digits.length >= 10 && c.phone && c.phone.replace(/[^0-9]/g, '').endsWith(digits.slice(-10)))
          );
        }
      }

      // If staff/admin viewing without specific client, fallback to first available active client
      if (!clientRecord && session.role !== 'CLIENT') {
        clientRecord = globalStore.clients.find((c) => c.status === 'ACTIVE') || globalStore.clients[0] || null;
      }
    }

    if (!clientRecord) {
      return NextResponse.json({
        authenticated: !!session,
        data: DEMO_BUSINESS_PROFILE,
        message: 'No specific client record found, using default baseline profile',
      });
    }

    // 3. Construct SyncedBusinessProfile purely from stored database records
    const rating = typeof clientRecord.averageRating === 'number' ? clientRecord.averageRating : 5.0;
    const reviewCount = typeof clientRecord.reviewCount === 'number' ? clientRecord.reviewCount : 0;
    const gbpScore = typeof clientRecord.gbpScore === 'number' ? clientRecord.gbpScore : 80;
    const photosCount = 12;
    const isPaused = clientRecord.status === 'PAUSED' || clientRecord.status === 'CHURNED';

    const profile: SyncedBusinessProfile = {
      clientId: clientRecord.id,
      isLiveSynced: true,
      businessName: clientRecord.businessName,
      category: clientRecord.category || 'Local Business',
      city: clientRecord.city || 'Ranchi',
      address: clientRecord.address || `${clientRecord.city || 'Ranchi'}, Jharkhand`,
      phone: clientRecord.phone || '+91 94311 00000',
      whatsapp: (clientRecord.whatsapp || clientRecord.phone || '+91 94311 00000').replace(/[^0-9]/g, ''),
      email: clientRecord.email || (session?.email ?? ''),
      googleMapsUrl: clientRecord.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(clientRecord.businessName)}`,
      placeId: `loc_${clientRecord.id}`,
      averageRating: rating,
      reviewCount: reviewCount,
      photosCount: photosCount,
      gbpScore: gbpScore,
      packageName: clientRecord.packageName || 'Growth Retainer Plan',
      monthlyRevenue: clientRecord.monthlyRevenue || 999,
      renewalDate: clientRecord.renewalDate
        ? new Date(clientRecord.renewalDate).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString(),
      googleOwnerEmail: session?.email || clientRecord.email,
      googleAccountName: `${clientRecord.businessName} (Verified Owner)`,
      syncedAt: 'Stored in CRM Database',
      status: clientRecord.status || 'ACTIVE',
      isOperational: !isPaused,
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
      authenticated: !!session,
      user: session,
      data: profile,
      source: 'DATABASE_STORED_RECORDS',
    });
  } catch (error: any) {
    console.error('GET /api/portal/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch portal profile' }, { status: 500 });
  }
}
