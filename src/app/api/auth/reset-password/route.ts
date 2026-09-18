import { NextResponse } from 'next/server';
import {
  requestPasswordReset,
  resetPasswordWithCode,
  changeUserPassword,
  getCurrentUserSession,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const forwardedHeader = request.headers.get('x-forwarded-for');
    const clientIp = forwardedHeader ? forwardedHeader.split(',')[0].trim() : 'unknown-ip';

    const body = await request.json();
    const { action } = body;

    // Action 1: Request Password Reset OTP
    if (action === 'request_code') {
      const { email } = body;
      if (!email || !email.trim()) {
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
      }

      // Rate limit: max 3 reset requests per 15 minutes per IP
      const rateCheck = checkRateLimit(`pwd_reset_req_${clientIp}`, 3, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: 'Too many password reset requests. Please wait a few minutes before trying again.' },
          { status: 429 }
        );
      }

      const result = await requestPasswordReset(email);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    // Action 2: Reset Password with OTP Code
    if (action === 'reset_password') {
      const { email, code, newPassword } = body;
      if (!email || !code || !newPassword) {
        return NextResponse.json(
          { error: 'Email, verification code, and new password are required' },
          { status: 400 }
        );
      }

      const rateCheck = checkRateLimit(`pwd_reset_sub_${clientIp}`, 10, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: 'Too many verification attempts. Please wait 15 minutes.' },
          { status: 429 }
        );
      }

      const result = await resetPasswordWithCode(email, code, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message });
    }

    // Action 3: In-App Password Change for Logged-In User
    if (action === 'change_password') {
      const session = await getCurrentUserSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
      }

      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      const result = await changeUserPassword(session.userId || session.email, currentPassword, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.message });
    }

    return NextResponse.json({ error: 'Invalid reset password action' }, { status: 400 });
  } catch (err: any) {
    console.error('Password reset API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Password reset service error' },
      { status: 500 }
    );
  }
}
