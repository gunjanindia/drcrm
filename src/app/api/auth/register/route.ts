import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      whatsapp,
      phone,
      email,
      businessName,
      city = 'Ranchi',
      district = '',
      address = '',
      category = 'Local Business',
      password,
      authMethod = 'CREDENTIALS',
      placeId = '',
      googleMapsUrl = '',
      averageRating = 5.0,
      reviewCount = 0,
      gbpScore = 80,
      isGbpLinked = false,
      reviews = [],
    } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = (whatsapp || phone || '').trim();
    const cleanName = name?.trim();
    const cleanBizName = businessName?.trim();
    const cleanCity = city?.trim() || 'Ranchi';
    const cleanDistrict = district?.trim() || '';
    const cleanAddress = address?.trim()
      ? `${address.trim()}${cleanDistrict ? ', ' + cleanDistrict : ''}, ${cleanCity}, Jharkhand`
      : cleanDistrict
      ? `${cleanDistrict}, ${cleanCity}, Jharkhand`
      : `Main Road, ${cleanCity}, Jharkhand`;

    if (!cleanEmail || !cleanName || !cleanBizName || !cleanPhone) {
      return NextResponse.json(
        { error: 'Name, WhatsApp number, email, and Business Name are required.' },
        { status: 400 }
      );
    }

    if (authMethod === 'CREDENTIALS' && (!password || password.length < 6)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Trial Calculation: 14 Days from now
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const initialAiCredits = 20;

    let existingUser = null;
    if (process.env.DATABASE_URL && prisma) {
      try {
        existingUser = await prisma.user.findFirst({
          where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        });
      } catch (e) {
        console.warn('Error checking existing user in Prisma:', e);
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password || 'GoogleOAuthDefaultPass_2026!');
    const tenantId = 'tenant_main';

    let createdUserId = `user_${Date.now()}`;
    let createdClientId = `client_${Date.now()}`;

    if (process.env.DATABASE_URL && prisma) {
      try {
        // Ensure tenant exists
        let tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
          tenant = await prisma.tenant.create({
            data: { id: tenantId, name: 'Digital Ranchi', domain: 'digitalranchi.in' },
          });
        }

        // Find or create default Account Manager
        let manager = await prisma.user.findFirst({
          where: { role: { in: ['SUPER_ADMIN', 'ACCOUNT_MANAGER', 'BUSINESS_ADMIN'] } },
        });

        if (!manager) {
          manager = await prisma.user.create({
            data: {
              tenantId,
              name: 'Gunjan Sharma',
              email: 'digitalranchigrowth@gmail.com',
              phone: '+91 70047 00318',
              passwordHash: await hashPassword('AdminDR@2026'),
              role: 'SUPER_ADMIN',
            },
          });
        }

        // Create Client Record with confirmed GBP details
        const client = await prisma.client.create({
          data: {
            tenantId,
            businessName: cleanBizName,
            legalName: cleanBizName,
            category,
            phone: cleanPhone,
            whatsapp: cleanPhone,
            email: cleanEmail,
            address: cleanAddress,
            city: cleanCity,
            state: 'Jharkhand',
            pincode: '834001',
            googleMapsUrl: googleMapsUrl || undefined,
            assignedManagerId: manager.id,
            packageId: 'pkg_trial_14d',
            packageName: 'Client 360 Pro (14-Day Free Trial)',
            monthlyRevenue: 1500.0,
            renewalDate: trialEndsAt,
            healthScore: 'GREEN',
            status: 'ONBOARDING',
            aiCreditBalance: initialAiCredits,
            trialEndsAt,
            subscriptionStatus: 'TRIAL',
            isGbpLinked: !!isGbpLinked,
            averageRating: typeof averageRating === 'number' ? averageRating : 5.0,
            reviewCount: typeof reviewCount === 'number' ? reviewCount : 0,
            gbpScore: typeof gbpScore === 'number' ? gbpScore : 80,
            gbpLocationId: placeId || undefined,
          },
        });
        createdClientId = client.id;

        // If verified reviews were provided, persist to TimelineActivity
        if (Array.isArray(reviews) && reviews.length > 0) {
          const { convertGoogleReviewsToClientReviews } = await import('@/lib/client-portal-sync');
          const formattedReviews = convertGoogleReviewsToClientReviews(reviews, cleanBizName);
          await prisma.timelineActivity.create({
            data: {
              clientId: client.id,
              type: 'GBP_REVIEWS_DATA',
              title: `Google Business Profile Initial Sync (${formattedReviews.length} reviews)`,
              description: JSON.stringify(formattedReviews),
              actorName: cleanEmail,
              timestamp: new Date(),
            },
          }).catch(() => null);
        }

        // Create User Record
        const user = await prisma.user.create({
          data: {
            tenantId,
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash,
            role: 'CLIENT',
            clientId: client.id,
            aiCreditBalance: initialAiCredits,
            trialEndsAt,
            subscriptionStatus: 'TRIAL',
          },
        });
        createdUserId = user.id;

        // Log initial credit grant in AiCreditUsageLog
        await prisma.aiCreditUsageLog.create({
          data: {
            tenantId,
            userId: user.id,
            clientId: client.id,
            userName: cleanName,
            businessName: cleanBizName,
            action: 'AI_AGENT_QUERY',
            featureName: 'Welcome Free Tier Bonus (+20 AI Credits)',
            creditsDeducted: -initialAiCredits,
            status: 'SUCCESS',
          },
        });
      } catch (dbErr) {
        console.error('Error creating user/client in Prisma:', dbErr);
      }
    }

    // Always ensure client exists in globalStore and file
    const storeClientRecord = {
      id: createdClientId,
      tenantId: 'tenant_main',
      businessName: cleanBizName,
      legalName: cleanBizName,
      category,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      email: cleanEmail,
      address: cleanAddress,
      city: cleanCity,
      state: 'Jharkhand',
      pincode: '834001',
      googleMapsUrl: googleMapsUrl || undefined,
      assignedManagerId: 'usr_super_admin',
      assignedManagerName: 'Gunjan Kumar',
      packageId: 'pkg_trial_14d',
      packageName: 'Client 360 Pro (14-Day Free Trial)',
      healthScore: 'GREEN' as const,
      healthReason: 'New 14-Day Free Demo client registered via web signup',
      monthlyRevenue: 1500,
      activeSince: new Date().toISOString(),
      renewalDate: trialEndsAt.toISOString(),
      reviewCount: typeof reviewCount === 'number' ? reviewCount : 0,
      averageRating: typeof averageRating === 'number' ? averageRating : 5.0,
      gbpScore: typeof gbpScore === 'number' ? gbpScore : 80,
      status: 'ONBOARDING' as const,
      aiCreditBalance: initialAiCredits,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionStatus: 'TRIAL',
      isGbpLinked: !!isGbpLinked,
      reviews: Array.isArray(reviews) ? reviews : [],
      createdAt: new Date().toISOString(),
    };

    const existingClientIdx = globalStore.clients.findIndex(
      (c) => c.id === createdClientId || c.email.toLowerCase() === cleanEmail
    );
    if (existingClientIdx !== -1) {
      globalStore.clients[existingClientIdx] = {
        ...globalStore.clients[existingClientIdx],
        ...storeClientRecord,
      };
    } else {
      globalStore.clients.unshift(storeClientRecord);
    }

    const storeUserRecord = {
      id: createdUserId,
      tenantId: 'tenant_main',
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'CLIENT' as const,
      clientId: createdClientId,
      department: 'Client Portal',
      passwordHash,
      aiCreditBalance: initialAiCredits,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionStatus: 'TRIAL',
      createdAt: new Date().toISOString(),
    };

    const existingUserIdx = globalStore.users.findIndex(
      (u) => u.email.toLowerCase() === cleanEmail || u.id === createdUserId
    );
    if (existingUserIdx !== -1) {
      globalStore.users[existingUserIdx] = {
        ...globalStore.users[existingUserIdx],
        ...storeUserRecord,
      };
    } else {
      globalStore.users.unshift(storeUserRecord);
    }

    globalStore.saveToFile();

    // Sign JWT Token
    const token = await signAuthToken({
      userId: createdUserId,
      name: cleanName,
      email: cleanEmail,
      role: 'CLIENT',
      tenantId,
      clientId: createdClientId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! 14-Day Free Trial & 20 AI Credits activated.',
      user: {
        id: createdUserId,
        name: cleanName,
        email: cleanEmail,
        role: 'CLIENT',
        clientId: createdClientId,
        aiCreditBalance: initialAiCredits,
        trialEndsAt: trialEndsAt.toISOString(),
      },
      redirectUrl: '/portal',
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
