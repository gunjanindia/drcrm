import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import { convertGoogleReviewsToClientReviews, SyncedBusinessProfile } from '@/lib/client-portal-sync';
import { lookupGooglePlace } from '@/lib/google-places';
import { logGoogleApiUsage } from '@/lib/ai-credits';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    const body = await request.json();
    const {
      clientId,
      businessName,
      category,
      city,
      address,
      phone,
      whatsapp,
      googleMapsUrl,
      placeId,
      averageRating,
      rating,
      reviewCount,
      photosCount,
      gbpScore,
      googleOwnerEmail,
      googleAccountName,
      reviews,
    } = body;

    const targetClientId = clientId || session?.clientId;
    let clientRecord: any = null;

    // 1. Locate Client in Database
    if (process.env.DATABASE_URL && prisma) {
      try {
        if (targetClientId) {
          clientRecord = await prisma.client.findUnique({
            where: { id: targetClientId },
          });
        }
        if (!clientRecord && session?.email) {
          clientRecord = await prisma.client.findFirst({
            where: { email: { equals: session.email, mode: 'insensitive' } },
          });
        }
      } catch (dbErr) {
        console.error('Error finding client in DB for GBP sync:', dbErr);
      }
    }

    if (!clientRecord) {
      clientRecord =
        globalStore.clients.find(
          (c) =>
            c.id === targetClientId ||
            (session?.email && c.email?.toLowerCase() === session.email.toLowerCase())
        ) || globalStore.clients[0];
    }

    // 2. Resolve real reviews: passed in body, or fetched live from Google Places
    let finalReviews = Array.isArray(reviews) && reviews.length > 0 ? reviews : [];

    const resolvedPlaceId = (placeId && !placeId.startsWith('loc_'))
      ? placeId
      : (clientRecord?.gbpLocationId || clientRecord?.placeId || placeId);

    if (finalReviews.length === 0 && (googleMapsUrl || businessName || resolvedPlaceId)) {
      try {
        const placeLookup = await lookupGooglePlace(
          businessName || clientRecord?.businessName || 'Business',
          city || clientRecord?.city || 'Ranchi',
          googleMapsUrl || clientRecord?.googleMapsUrl,
          category || clientRecord?.category,
          resolvedPlaceId
        );

        if (placeLookup.status === 'VERIFIED_MATCH' && Array.isArray(placeLookup.reviews) && placeLookup.reviews.length > 0) {
          finalReviews = convertGoogleReviewsToClientReviews(placeLookup.reviews, businessName || placeLookup.name || 'Business');
        }
      } catch (err) {
        console.error('Live place lookup during sync error:', err);
      }
    }

    const resolvedRating = typeof rating === 'number' ? rating : (typeof averageRating === 'number' ? averageRating : 5.0);
    const resolvedReviewCount = typeof reviewCount === 'number' && reviewCount >= 0
      ? reviewCount
      : finalReviews.length;
    const resolvedPhotosCount = typeof photosCount === 'number' && photosCount >= 0
      ? photosCount
      : (finalReviews.length > 0 ? 1 : 0);
    const resolvedGbpScore = typeof gbpScore === 'number' ? gbpScore : (resolvedReviewCount >= 10 ? 88 : (resolvedReviewCount >= 2 ? 80 : 70));

    const effectiveClientId = targetClientId || clientRecord?.id || `cli_portal_${Date.now()}`;

    // 3. Persist update in Prisma PostgreSQL
    if (process.env.DATABASE_URL && prisma) {
      try {
        if (clientRecord) {
          await prisma.client.update({
            where: { id: clientRecord.id },
            data: {
              businessName: businessName || clientRecord.businessName,
              category: category || clientRecord.category,
              city: city || clientRecord.city,
              address: address || clientRecord.address,
              phone: phone || clientRecord.phone,
              whatsapp: whatsapp || phone || clientRecord.whatsapp,
              googleMapsUrl: googleMapsUrl || clientRecord.googleMapsUrl,
              averageRating: resolvedRating,
              reviewCount: resolvedReviewCount,
              gbpScore: resolvedGbpScore,
              status: 'ACTIVE',
            },
          });
        }

        // Save Synced Reviews Array into TimelineActivity (Permanent DB storage across serverless reloads)
        if (finalReviews && finalReviews.length > 0) {
          await prisma.timelineActivity.create({
            data: {
              clientId: effectiveClientId,
              type: 'GBP_REVIEWS_DATA',
              title: `Google Maps Live Reviews Snapshot (${finalReviews.length} reviews)`,
              description: JSON.stringify(finalReviews),
              actorName: googleOwnerEmail || session?.email || 'GBP Sync Engine',
              timestamp: new Date(),
            },
          }).catch((e) => console.error('Error saving GBP_REVIEWS_DATA to TimelineActivity:', e));
        }

        // Upsert GBP profile
        await prisma.gbpProfile.upsert({
          where: { clientId: effectiveClientId },
          update: {
            locationName: businessName || clientRecord?.businessName,
            primaryCategory: category || clientRecord?.category,
            rating: resolvedRating,
            reviewCount: resolvedReviewCount,
            photosCount: resolvedPhotosCount,
            healthScore: resolvedGbpScore,
            isVerified: true,
            lastAuditDate: new Date(),
          },
          create: {
            clientId: effectiveClientId,
            locationName: businessName || 'My Business',
            primaryCategory: category || 'Local Business',
            rating: resolvedRating,
            reviewCount: resolvedReviewCount,
            photosCount: resolvedPhotosCount,
            healthScore: resolvedGbpScore,
            isVerified: true,
            missingAttributes: [],
            lastAuditDate: new Date(),
          },
        }).catch((e) => console.error('GbpProfile upsert error:', e));

        // Log Timeline Activity for Sync Event
        await prisma.timelineActivity.create({
          data: {
            clientId: effectiveClientId,
            type: 'GBP_SYNCED',
            title: `Live Google Business Profile Synced`,
            description: `Connected to Google Maps listing (${resolvedReviewCount} reviews, ${resolvedRating}⭐ rating) by ${googleOwnerEmail || session?.email || 'Owner'}.`,
            actorName: googleOwnerEmail || session?.email || 'GBP Sync Wizard',
            timestamp: new Date(),
          },
        }).catch(() => null);

        // Log Google Maps & Places Platform API Expense for Admin Monitor
        await logGoogleApiUsage({
          clientId: effectiveClientId,
          userId: session?.userId,
          userName: googleOwnerEmail || session?.name || businessName || 'Business Owner',
          businessName: businessName || clientRecord?.businessName || 'Business',
          action: 'GOOGLE_PLACES_SYNC',
          featureName: `Google Places API Sync (${resolvedReviewCount} reviews, ${resolvedRating}⭐)`,
          apiType: 'PLACES_DETAILS',
          callsCount: 1,
          metadata: {
            placeId: placeId || effectiveClientId,
            reviewCount: resolvedReviewCount,
            rating: resolvedRating,
            googleMapsUrl: googleMapsUrl || clientRecord?.googleMapsUrl,
          },
        }).catch((err) => console.warn('Failed to log Google Places API expense:', err));
      } catch (dbErr) {
        console.error('Error updating Client in DB during GBP sync:', dbErr);
      }
    }

    // 4. Update or Add in globalStore.clients & crm_store.json
    let storeClient = globalStore.clients.find((c) => c.id === effectiveClientId || c.id === clientRecord?.id);
    if (storeClient) {
      storeClient.businessName = businessName || storeClient.businessName;
      storeClient.category = category || storeClient.category;
      storeClient.city = city || storeClient.city;
      storeClient.address = address || storeClient.address;
      storeClient.phone = phone || storeClient.phone;
      storeClient.whatsapp = whatsapp || phone || storeClient.whatsapp;
      storeClient.googleMapsUrl = googleMapsUrl || storeClient.googleMapsUrl;
      storeClient.gbpLocationId = resolvedPlaceId || storeClient.gbpLocationId;
      storeClient.averageRating = resolvedRating;
      storeClient.reviewCount = resolvedReviewCount;
      storeClient.gbpScore = resolvedGbpScore;
      storeClient.status = 'ACTIVE';
      storeClient.isGbpLinked = true;
      (storeClient as any).isLiveSynced = true;
      (storeClient as any).reviews = finalReviews;
      (storeClient as any).googleOwnerEmail = googleOwnerEmail;
      (storeClient as any).googleAccountName = googleAccountName;
    } else {
      const newClient = {
        id: effectiveClientId,
        tenantId: 'tenant_main',
        businessName: businessName || 'My Business',
        category: category || 'Local Business',
        phone: phone || '+91 94311 00000',
        whatsapp: whatsapp || phone || '+91 94311 00000',
        email: session?.email || googleOwnerEmail || 'client@digitalranchi.in',
        address: address || `${city || 'Ranchi'}, Jharkhand`,
        city: city || 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        googleMapsUrl: googleMapsUrl || '',
        assignedManagerId: 'usr_super_admin',
        assignedManagerName: 'Gunjan Kumar',
        packageId: 'pkg_growth_999',
        packageName: 'Growth Retainer Plan',
        healthScore: 'GREEN' as const,
        healthReason: 'Active GBP Live Sync',
        monthlyRevenue: 999,
        activeSince: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        gbpLocationId: resolvedPlaceId || `loc_${effectiveClientId}`,
        averageRating: resolvedRating,
        reviewCount: resolvedReviewCount,
        gbpScore: resolvedGbpScore,
        status: 'ACTIVE' as const,
        isGbpLinked: true,
        createdAt: new Date().toISOString(),
      };
      (newClient as any).isLiveSynced = true;
      (newClient as any).reviews = finalReviews;
      (newClient as any).googleOwnerEmail = googleOwnerEmail;
      (newClient as any).googleAccountName = googleAccountName;
      globalStore.clients.push(newClient);
      storeClient = newClient;
    }
    globalStore.saveToFile();

    const formattedSyncDate = `${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} • ${new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const profileData = {
      clientId: storeClient.id,
      isLiveSynced: true,
      businessName: storeClient.businessName,
      category: storeClient.category,
      city: storeClient.city,
      address: storeClient.address,
      phone: storeClient.phone,
      whatsapp: storeClient.whatsapp,
      email: storeClient.email,
      googleMapsUrl: storeClient.googleMapsUrl,
      placeId: resolvedPlaceId || storeClient.gbpLocationId,
      averageRating: resolvedRating,
      reviewCount: resolvedReviewCount,
      photosCount: resolvedPhotosCount,
      gbpScore: resolvedGbpScore,
      googleOwnerEmail: googleOwnerEmail || storeClient.email,
      googleAccountName: googleAccountName || `${storeClient.businessName} (Verified Owner)`,
      syncedAt: formattedSyncDate,
      status: 'ACTIVE' as const,
      isOperational: true,
      reviews: finalReviews,
    };

    return NextResponse.json({
      success: true,
      message: 'Google Business Profile live data and verified reviews successfully synced and saved to CRM.',
      data: profileData,
      profile: profileData,
    });
  } catch (error: any) {
    console.error('POST /api/portal/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync GBP profile data' },
      { status: 500 }
    );
  }
}
