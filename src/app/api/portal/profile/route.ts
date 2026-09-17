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

    // Resolve reviews: Check persistent TimelineActivity in Neon PostgreSQL first
    let reviewsToUse: any[] = [];

    if (process.env.DATABASE_URL && prisma) {
      try {
        const storedReviewsActivity = await prisma.timelineActivity.findFirst({
          where: {
            clientId: clientRecord.id,
            type: 'GBP_REVIEWS_DATA',
          },
          orderBy: { timestamp: 'desc' },
        });

        if (storedReviewsActivity && storedReviewsActivity.description) {
          const parsed = JSON.parse(storedReviewsActivity.description);
          if (Array.isArray(parsed) && parsed.length > 0) {
            reviewsToUse = parsed;
          }
        }
      } catch (e) {
        console.error('Error fetching GBP_REVIEWS_DATA for profile:', e);
      }
    }

    // Check clientRecord.reviews in memory / globalStore
    if (reviewsToUse.length === 0) {
      if (Array.isArray((clientRecord as any).reviews) && (clientRecord as any).reviews.length > 0) {
        reviewsToUse = (clientRecord as any).reviews;
      } else {
        const storeClient = globalStore.clients.find((c) => c.id === clientRecord.id);
        if (storeClient && Array.isArray((storeClient as any).reviews) && (storeClient as any).reviews.length > 0) {
          reviewsToUse = (storeClient as any).reviews;
        }
      }
    }

    // Check AuditRecord in DB if synced previously via audit engine
    if (reviewsToUse.length === 0 && process.env.DATABASE_URL && prisma) {
      try {
        const auditRec = await prisma.auditRecord.findFirst({
          where: {
            OR: [
              { businessName: { contains: clientRecord.businessName, mode: 'insensitive' } },
              ...(clientRecord.googleMapsUrl ? [{ googleMapsUrl: clientRecord.googleMapsUrl }] : []),
              ...(clientRecord.phone ? [{ phone: { contains: clientRecord.phone.slice(-10) } }] : []),
            ],
          },
          orderBy: { scannedAt: 'desc' },
        });

        if (auditRec && auditRec.matchedPlace) {
          const mp = auditRec.matchedPlace as any;
          if (Array.isArray(mp.reviews) && mp.reviews.length > 0) {
            const { convertGoogleReviewsToClientReviews } = await import('@/lib/client-portal-sync');
            reviewsToUse = convertGoogleReviewsToClientReviews(mp.reviews, clientRecord.businessName);
          }
        }
      } catch (e) {
        console.error('Error fetching reviews from AuditRecord in DB:', e);
      }
    }

    // If still no reviews but client has a businessName or googleMapsUrl, perform live server lookup
    if (reviewsToUse.length === 0 && (clientRecord.businessName || clientRecord.googleMapsUrl)) {
      try {
        const { lookupGooglePlace } = await import('@/lib/google-places');
        const { convertGoogleReviewsToClientReviews } = await import('@/lib/client-portal-sync');
        const placeLookup = await lookupGooglePlace(
          clientRecord.businessName,
          clientRecord.city || 'Ranchi',
          clientRecord.googleMapsUrl,
          clientRecord.category
        );

        if (placeLookup.status === 'VERIFIED_MATCH' && Array.isArray(placeLookup.reviews) && placeLookup.reviews.length > 0) {
          reviewsToUse = convertGoogleReviewsToClientReviews(placeLookup.reviews, clientRecord.businessName);

          // Cache verified reviews to PostgreSQL TimelineActivity
          if (process.env.DATABASE_URL && prisma) {
            await prisma.timelineActivity.create({
              data: {
                clientId: clientRecord.id,
                type: 'GBP_REVIEWS_DATA',
                title: `Google Maps Live Reviews Snapshot (${reviewsToUse.length} reviews)`,
                description: JSON.stringify(reviewsToUse),
                actorName: session?.email || 'Server Auto-Sync',
                timestamp: new Date(),
              },
            }).catch(() => null);

            // Update client rating and review count
            await prisma.client.update({
              where: { id: clientRecord.id },
              data: {
                reviewCount: placeLookup.userRatingsTotal || placeLookup.reviews.length,
                averageRating: placeLookup.rating || clientRecord.averageRating || 5.0,
              },
            }).catch(() => null);
          }
        }
      } catch (liveSyncErr) {
        console.error('Server live sync error during profile fetch:', liveSyncErr);
      }
    }

    // Resolve last sync date from TimelineActivity or GbpProfile
    let lastSyncDate: Date | null = null;
    let customGrowthMetrics: any[] | null = null;

    if (process.env.DATABASE_URL && prisma) {
      try {
        const lastSyncActivity = await prisma.timelineActivity.findFirst({
          where: {
            clientId: clientRecord.id,
            type: { in: ['GBP_SYNCED', 'GBP_REVIEWS_DATA', 'GBP_OAUTH_TOKENS', 'AUDIT_COMPLETED'] },
          },
          orderBy: { timestamp: 'desc' },
        });

        if (lastSyncActivity && lastSyncActivity.timestamp) {
          lastSyncDate = new Date(lastSyncActivity.timestamp);
        }

        const storedGrowthActivity = await prisma.timelineActivity.findFirst({
          where: {
            clientId: clientRecord.id,
            type: 'GBP_GROWTH_METRICS',
          },
          orderBy: { timestamp: 'desc' },
        });
        if (storedGrowthActivity && storedGrowthActivity.description) {
          const parsedGrowth = JSON.parse(storedGrowthActivity.description);
          if (Array.isArray(parsedGrowth) && parsedGrowth.length > 0) {
            customGrowthMetrics = parsedGrowth;
          }
        }
      } catch (e) {
        console.error('Error fetching last sync date for profile:', e);
      }
    }

    if (!lastSyncDate && clientRecord.updatedAt) {
      lastSyncDate = new Date(clientRecord.updatedAt);
    }
    if (!lastSyncDate) {
      lastSyncDate = new Date();
    }

    const formattedSyncDate = `${lastSyncDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} • ${lastSyncDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const isPaused = clientRecord.status === 'PAUSED';
    const isLinked = clientRecord.isGbpLinked ?? false;

    const profile: SyncedBusinessProfile = {
      clientId: clientRecord.id,
      isLiveSynced: isLinked,
      businessName: clientRecord.businessName,
      category: clientRecord.category || 'Local Business',
      city: clientRecord.city || 'Ranchi',
      address: clientRecord.address || `${clientRecord.city || 'Ranchi'}, Jharkhand`,
      phone: clientRecord.phone || '+91 94311 00000',
      whatsapp: (clientRecord.whatsapp || clientRecord.phone || '+91 94311 00000').replace(/[^0-9]/g, ''),
      email: clientRecord.email || (session?.email ?? ''),
      googleMapsUrl: clientRecord.googleMapsUrl || (clientRecord.businessName ? `https://maps.google.com/?q=${encodeURIComponent(clientRecord.businessName + ' ' + (clientRecord.city || 'Ranchi'))}` : ''),
      placeId: clientRecord.gbpLocationId || clientRecord.placeId || `loc_${clientRecord.id}`,
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
      syncedAt: formattedSyncDate,
      status: clientRecord.status || 'ACTIVE',
      isOperational: !isPaused,
      reviews: reviewsToUse,
      growthMetrics: customGrowthMetrics || generateDynamicGrowthForBusiness(reviewCount, rating, gbpScore),
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
      aiCreditBalance: clientRecord.aiCreditBalance ?? 20,
      trialEndsAt: clientRecord.trialEndsAt
        ? new Date(clientRecord.trialEndsAt).toISOString()
        : new Date(Date.now() + 14 * 86400000).toISOString(),
      subscriptionStatus: clientRecord.subscriptionStatus || 'TRIAL',
      isGbpLinked: isLinked,
    };

    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session,
      data: profile,
      profile: profile,
      source: 'DATABASE_STORED_RECORDS',
    });
  } catch (error: any) {
    console.error('GET /api/portal/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch portal profile' }, { status: 500 });
  }
}
