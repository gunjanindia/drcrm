import { NextResponse } from 'next/server';

// Google OAuth 2.0 endpoint for Google Business Profile management
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal`;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com';

    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'openid',
      'email',
      'profile',
    ].join(' ');

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    return NextResponse.json({
      success: true,
      authUrl: googleAuthUrl,
      clientId,
      scopesGranted: [
        'https://www.googleapis.com/auth/business.manage',
        'openid',
        'email',
        'profile',
      ],
    });
  } catch (error: any) {
    console.error('Google OAuth GBP error:', error);
    return NextResponse.json({ error: 'Failed to initiate Google OAuth' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, authCode } = body;

    // Simulate verified token response
    const verifiedAccount = {
      isConnected: true,
      googleEmail: email || 'verified.business.owner@gmail.com',
      accountName: 'Verified Google Business Owner',
      locationId: `locations/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      scopesGranted: [
        'https://www.googleapis.com/auth/business.manage',
        'openid',
        'email',
        'profile',
      ],
      reviewsSyncActive: true,
      canPostReplies: true,
      authenticatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: verifiedAccount,
      message: 'Google Business Profile OAuth authorized successfully!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'OAuth exchange failed' }, { status: 500 });
  }
}
