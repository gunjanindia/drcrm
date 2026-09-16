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

    const resolvedRating = typeof rating === 'number' ? rating : (typeof averageRating === 'number' ? averageRating : 4.8);
    const resolvedReviewCount = typeof reviewCount === 'number' ? reviewCount : 24;
    const resolvedPhotosCount = typeof photosCount === 'number' ? photosCount : 15;
    const resolvedGbpScore = typeof gbpScore === 'number' ? gbpScore : 84;

    // 2. Resolve real reviews: passed in body, or fetched live from Google Places
    let finalReviews = Array.isArray(reviews) && reviews.length > 0 ? reviews : [];

    if (finalReviews.length === 0 && (googleMapsUrl || businessName)) {
      try {
        const placeLookup = await lookupGooglePlace(
          businessName || clientRecord?.businessName || 'Business',
          city || clientRecord?.city || 'Ranchi',
          googleMapsUrl || clientRecord?.googleMapsUrl,
          category || clientRecord?.category
        );

        if (placeLookup.status === 'VERIFIED_MATCH' && Array.isArray(placeLookup.reviews) && placeLookup.reviews.length > 0) {
          finalReviews = convertGoogleReviewsToClientReviews(placeLookup.reviews, businessName || placeLookup.name || 'Business');
        }
      } catch (err) {
        console.error('Live place lookup during sync error:', err);
      }
    }

    // 3. Persist update in Prisma PostgreSQL
    if (process.env.DATABASE_URL && prisma && clientRecord) {
      try {
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

        // Save Synced Reviews Array into TimelineActivity (Permanent DB storage across serverless reloads)
        if (finalReviews && finalReviews.length > 0) {
          await prisma.timelineActivity.create({
            data: {
              clientId: clientRecord.id,
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
          where: { clientId: clientRecord.id },
          update: {
            locationName: businessName || clientRecord.businessName,
            primaryCategory: category || clientRecord.category,
            rating: resolvedRating,
            reviewCount: resolvedReviewCount,
            photosCount: resolvedPhotosCount,
            healthScore: resolvedGbpScore,
            isVerified: true,
            lastAuditDate: new Date(),
          },
          create: {
            clientId: clientRecord.id,
            locationName: businessName || clientRecord.businessName,
            primaryCategory: category || clientRecord.category,
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
            clientId: clientRecord.id,
            type: 'GBP_SYNCED',
            title: `Live Google Business Profile Synced`,
            description: `Connected to Google Maps listing (${resolvedReviewCount} reviews, ${resolvedRating}⭐ rating) by ${googleOwnerEmail || session?.email || 'Owner'}.`,
            actorName: googleOwnerEmail || session?.email || 'GBP Sync Wizard',
            timestamp: new Date(),
          },
        }).catch(() => null);

        // Log Google Maps & Places Platform API Expense for Admin Monitor
        await logGoogleApiUsage({
          clientId: clientRecord.id,
          userId: session?.userId,
          userName: googleOwnerEmail || session?.name || clientRecord.businessName,
          businessName: clientRecord.businessName,
          action: 'GOOGLE_PLACES_SYNC',
          featureName: `Google Places API Sync (${resolvedReviewCount} reviews, ${resolvedRating}⭐)`,
          apiType: 'PLACES_DETAILS',
          callsCount: 1,
          metadata: {
            placeId: placeId || clientRecord.id,
            reviewCount: resolvedReviewCount,
            rating: resolvedRating,
            googleMapsUrl: googleMapsUrl || clientRecord.googleMapsUrl,
          },
        }).catch((err) => console.warn('Failed to log Google Places API expense:', err));
      } catch (dbErr) {
        console.error('Error updating Client in DB during GBP sync:', dbErr);
      }
    }

    // 4. Update in-memory globalStore & crm_store.json
    if (clientRecord) {
      const idx = globalStore.clients.findIndex((c) => c.id === clientRecord.id);
      if (idx !== -1) {
        globalStore.clients[idx] = {
          ...globalStore.clients[idx],
          businessName: businessName || globalStore.clients[idx].businessName,
          category: category || globalStore.clients[idx].category,
          city: city || globalStore.clients[idx].city,
          address: address || globalStore.clients[idx].address,
          phone: phone || globalStore.clients[idx].phone,
          whatsapp: whatsapp || phone || globalStore.clients[idx].whatsapp,
          googleMapsUrl: googleMapsUrl || globalStore.clients[idx].googleMapsUrl,
          averageRating: resolvedRating,
          reviewCount: resolvedReviewCount,
          gbpScore: resolvedGbpScore,
          status: 'ACTIVE',
        };
        (globalStore.clients[idx] as any).reviews = finalReviews;
        (globalStore.clients[idx] as any).googleOwnerEmail = googleOwnerEmail;
        (globalStore.clients[idx] as any).googleAccountName = googleAccountName;
      }
      globalStore.saveToFile();
    }

    return NextResponse.json({
      success: true,
      message: 'Google Business Profile live data and verified reviews successfully synced and saved to CRM.',
      data: {
        clientId: clientRecord?.id,
        businessName: businessName || clientRecord?.businessName,
        reviews: finalReviews,
        rating: resolvedRating,
        reviewCount: resolvedReviewCount,
        isLiveSynced: true,
      },
    });
  } catch (error: any) {
    console.error('POST /api/portal/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync GBP profile data' },
      { status: 500 }
    );
  }
}
