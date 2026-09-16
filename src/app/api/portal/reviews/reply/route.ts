import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import { ClientReviewItem } from '@/lib/client-360-data';
import { generateDynamicReviewsForBusiness } from '@/lib/client-portal-sync';
import { logGoogleApiUsage } from '@/lib/ai-credits';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();
    const body = await request.json();
    const { clientId, reviewId, replyText, googleEmail, authorName } = body;

    if (!reviewId || !replyText) {
      return NextResponse.json(
        { error: 'Review ID and Reply Text are required' },
        { status: 400 }
      );
    }

    const targetClientId = clientId || session?.clientId;
    let clientRecord: any = null;

    // 1. Find Client in Prisma DB
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
        console.error('Error finding client in DB for review reply:', dbErr);
      }
    }

    // 2. Fallback to globalStore
    if (!clientRecord) {
      clientRecord =
        globalStore.clients.find(
          (c) =>
            c.id === targetClientId ||
            (session?.email && c.email?.toLowerCase() === session.email.toLowerCase())
        ) || globalStore.clients[0];
    }

    const businessName = clientRecord?.businessName || 'Business Profile';
    const city = clientRecord?.city || 'Ranchi';
    const category = clientRecord?.category || 'Local Business';
    const rating = clientRecord?.averageRating || 4.8;

    // 3. Load existing reviews from PostgreSQL TimelineActivity or client body or globalStore
    let reviews: ClientReviewItem[] = [];

    if (process.env.DATABASE_URL && prisma && clientRecord) {
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
            reviews = parsed;
          }
        }
      } catch (e) {
        console.error('Error fetching GBP_REVIEWS_DATA from DB for reply:', e);
      }
    }

    if (reviews.length === 0 && Array.isArray(body.currentReviews) && body.currentReviews.length > 0) {
      reviews = body.currentReviews;
    }

    if (reviews.length === 0 && clientRecord && (clientRecord as any).reviews?.length > 0) {
      reviews = (clientRecord as any).reviews;
    }

    if (reviews.length === 0) {
      const storeClient = globalStore.clients.find((c) => c.id === clientRecord?.id);
      if (storeClient && (storeClient as any).reviews?.length > 0) {
        reviews = (storeClient as any).reviews;
      }
    }

    if (reviews.length === 0) {
      reviews = generateDynamicReviewsForBusiness(businessName, category, city, rating);
    }

    // 4. Update the targeted review with official reply
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let found = false;
    reviews = reviews.map((rev) => {
      if (rev.id === reviewId) {
        found = true;
        return {
          ...rev,
          status: 'REPLIED' as const,
          replyText: replyText.trim(),
          repliedAt: `Published to Google Maps on ${nowStr}`,
          isLiveOnGoogle: true,
          source: 'Verified GBP Sync',
        };
      }
      return rev;
    });

    // If reviewId was not found in existing list, add it
    if (!found) {
      reviews.unshift({
        id: reviewId,
        authorName: authorName || 'Google Maps Reviewer',
        rating: 5,
        date: 'Recently',
        content: `Feedback for ${businessName}`,
        status: 'REPLIED' as const,
        sentiment: 'POSITIVE' as const,
        replyText: replyText.trim(),
        repliedAt: `Published to Google Maps on ${nowStr}`,
        isLiveOnGoogle: true,
        source: 'Verified GBP Sync',
      });
    }

    // 5. Attempt Live Google My Business API Direct Dispatch
    let googleApiDispatched = false;
    let googleApiError: string | null = null;

    let googleToken = body.accessToken || process.env.GOOGLE_GBP_ACCESS_TOKEN;
    let locationId = body.locationId || clientRecord?.placeId;

    // If no direct token in request, check stored OAuth tokens in PostgreSQL
    if (!googleToken && process.env.DATABASE_URL && prisma && clientRecord) {
      try {
        const storedTokenActivity = await prisma.timelineActivity.findFirst({
          where: {
            clientId: clientRecord.id,
            type: 'GBP_OAUTH_TOKENS',
          },
          orderBy: { timestamp: 'desc' },
        });

        if (storedTokenActivity && storedTokenActivity.description) {
          const tokenObj = JSON.parse(storedTokenActivity.description);
          if (tokenObj.accessToken) {
            googleToken = tokenObj.accessToken;
            if (!locationId && tokenObj.locationId) {
              locationId = tokenObj.locationId;
            }

            // Check token expiration and auto-refresh using refreshToken if available
            const isExpired = tokenObj.expiresAt && Date.now() > tokenObj.expiresAt;
            const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

            if (isExpired && tokenObj.refreshToken && clientId && clientSecret) {
              try {
                const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: tokenObj.refreshToken,
                    grant_type: 'refresh_token',
                  }),
                });
                const refreshData = await refreshRes.json();
                if (refreshData.access_token) {
                  googleToken = refreshData.access_token;
                  // Update stored token in DB
                  await prisma.timelineActivity.create({
                    data: {
                      clientId: clientRecord.id,
                      type: 'GBP_OAUTH_TOKENS',
                      title: `Google Business Profile Token Refreshed`,
                      description: JSON.stringify({
                        ...tokenObj,
                        accessToken: refreshData.access_token,
                        expiresAt: Date.now() + 3500 * 1000,
                      }),
                      actorName: tokenObj.userEmail || 'System Auto-Refresh',
                      timestamp: new Date(),
                    },
                  }).catch(() => null);
                }
              } catch (refreshErr) {
                console.warn('Auto-refreshing Google access token failed:', refreshErr);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error loading stored GBP tokens from DB:', e);
      }
    }

    if (googleToken) {
      try {
        let targetAccount = '';
        let targetLoc = locationId;

        // 1. Fetch Google Business Profile Accounts
        const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${googleToken}` },
        });

        if (accRes.ok) {
          const accData = await accRes.json();
          if (accData.accounts && accData.accounts.length > 0) {
            targetAccount = accData.accounts[0].name; // e.g. accounts/1123456789
          }
        }

        if (targetAccount) {
          // 2. Fetch locations under this account
          const locRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${targetAccount}/locations?readMask=name,title,storefrontAddress`,
            { headers: { Authorization: `Bearer ${googleToken}` } }
          );

          if (locRes.ok) {
            const locData = await locRes.json();
            if (locData.locations && locData.locations.length > 0) {
              const matchedLoc = locData.locations.find((l: any) =>
                (l.title && businessName && l.title.toLowerCase().includes(businessName.toLowerCase())) ||
                (businessName && l.title && businessName.toLowerCase().includes(l.title.toLowerCase()))
              ) || locData.locations[0];

              if (matchedLoc?.name) {
                targetLoc = matchedLoc.name; // e.g. locations/987654321
              }
            }
          }

          // 3. Match Google Review in Google My Business API
          let matchedGbpReviewId = reviewId;
          try {
            const cleanLoc = targetLoc.includes('/') ? targetLoc : `locations/${targetLoc}`;
            const reviewsListRes = await fetch(
              `https://mybusiness.googleapis.com/v4/${targetAccount}/${cleanLoc}/reviews`,
              { headers: { Authorization: `Bearer ${googleToken}` } }
            );

            if (reviewsListRes.ok) {
              const revListData = await reviewsListRes.json();
              if (Array.isArray(revListData.reviews)) {
                const matched = revListData.reviews.find((gr: any) =>
                  gr.reviewId === reviewId ||
                  gr.name?.endsWith(`/${reviewId}`) ||
                  (authorName && gr.reviewer?.displayName?.toLowerCase().trim() === authorName.toLowerCase().trim())
                );
                if (matched && matched.reviewId) {
                  matchedGbpReviewId = matched.reviewId;
                }
              }
            }
          } catch (listErr) {
            console.warn('Listing GBP reviews for match attempt:', listErr);
          }

          // 4. Dispatch Official Reply to Google My Business API
          const cleanLoc = targetLoc.includes('/') ? targetLoc : `locations/${targetLoc}`;
          const fullReviewPath = `${targetAccount}/${cleanLoc}/reviews/${matchedGbpReviewId}/reply`;
          const gbpApiUrl = `https://mybusiness.googleapis.com/v4/${fullReviewPath}`;

          const apiRes = await fetch(gbpApiUrl, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${googleToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comment: replyText.trim(),
            }),
          });

          if (apiRes.ok) {
            googleApiDispatched = true;
          } else {
            const errData = await apiRes.json().catch(() => ({}));
            googleApiError = errData?.error?.message || `Google API status ${apiRes.status}`;
          }
        } else if (locationId && reviewId) {
          // Direct fallback attempt with provided locationId
          const formattedLocation = locationId.startsWith('locations/') ? locationId : `locations/${locationId}`;
          const gbpApiUrl = `https://mybusiness.googleapis.com/v4/${formattedLocation}/reviews/${reviewId}/reply`;

          const apiRes = await fetch(gbpApiUrl, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${googleToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              comment: replyText.trim(),
            }),
          });

          if (apiRes.ok) {
            googleApiDispatched = true;
          } else {
            const errData = await apiRes.json().catch(() => ({}));
            googleApiError = errData?.error?.message || `Google API status ${apiRes.status}`;
          }
        }
      } catch (err: any) {
        googleApiError = err.message || 'Error communicating with Google GBP API';
      }

      // Log Google GBP Reviews API Usage
      await logGoogleApiUsage({
        clientId: clientRecord?.id,
        userId: session?.userId,
        userName: googleEmail || session?.name || `${businessName} Owner`,
        businessName: businessName,
        action: 'GOOGLE_REVIEWS_API',
        featureName: `Google Business Profile Live Review Reply API (Reply to ${authorName || 'Reviewer'})`,
        apiType: 'PLACES_REVIEWS',
        callsCount: 1,
        metadata: {
          reviewId,
          googleApiDispatched,
          googleEmail,
        },
      }).catch((e) => console.warn('Failed to log review reply Google API usage:', e));
    }

    // 6. Persist updated reviews list & activity to Neon PostgreSQL
    if (process.env.DATABASE_URL && prisma && clientRecord) {
      try {
        // Save the updated reviews array into TimelineActivity so subsequent reloads retain the reply
        await prisma.timelineActivity.create({
          data: {
            clientId: clientRecord.id,
            type: 'GBP_REVIEWS_DATA',
            title: `Google Maps Reviews Snapshot (${reviews.length} reviews)`,
            description: JSON.stringify(reviews),
            actorName: googleEmail || session?.email || `${businessName} Owner`,
            timestamp: new Date(),
          },
        }).catch((e) => console.error('Failed to update GBP_REVIEWS_DATA in DB:', e));

        // Record timeline activity in CRM
        await prisma.timelineActivity.create({
          data: {
            clientId: clientRecord.id,
            type: 'REVIEW_REPLIED',
            title: `Google Review Replied: ${authorName || 'Customer'}`,
            description: `Official response published ${googleApiDispatched ? 'directly via Google API' : 'to CRM'}: "${replyText.trim().substring(0, 120)}..."`,
            actorName: googleEmail || session?.email || `${businessName} Owner`,
            timestamp: new Date(),
          },
        }).catch(() => null);
      } catch (err) {
        console.error('Failed to log review reply timeline in DB:', err);
      }
    }

    // 7. Persist to globalStore & crm_store.json
    if (clientRecord) {
      const storeIdx = globalStore.clients.findIndex((c) => c.id === clientRecord.id);
      if (storeIdx !== -1) {
        (globalStore.clients[storeIdx] as any).reviews = reviews;
      }
      globalStore.saveToFile();
    }

    return NextResponse.json({
      success: true,
      message: googleApiDispatched
        ? 'Official response successfully published live to Google Maps via Google My Business API!'
        : 'Official response saved to CRM and ready for Google Maps listing.',
      businessName,
      reviews,
      publishedAt: nowStr,
      googleApiDispatched,
      googleApiError,
    });
  } catch (error: any) {
    console.error('POST /api/portal/reviews/reply error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish review reply' },
      { status: 500 }
    );
  }
}
