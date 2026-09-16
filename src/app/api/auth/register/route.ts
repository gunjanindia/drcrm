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
      category = 'Local Business',
      password,
      authMethod = 'CREDENTIALS',
    } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = (whatsapp || phone || '').trim();
    const cleanName = name?.trim();
    const cleanBizName = businessName?.trim();
    const cleanCity = city?.trim() || 'Ranchi';

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

        // Create Client Record
        const client = await prisma.client.create({
          data: {
            tenantId,
            businessName: cleanBizName,
            legalName: cleanBizName,
            category,
            phone: cleanPhone,
            whatsapp: cleanPhone,
            email: cleanEmail,
            address: `Main Road, ${cleanCity}, Jharkhand`,
            city: cleanCity,
            state: 'Jharkhand',
            pincode: '834001',
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
            isGbpLinked: false,
          },
        });
        createdClientId = client.id;

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
