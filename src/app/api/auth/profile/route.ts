import { NextResponse } from 'next/server';
import { getCurrentUserSession, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET() {
  const session = await getCurrentUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = globalStore.users.find((u) => u.id === session.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      clientId: user.clientId,
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, phone } = body;

    const user = globalStore.users.find((u) => u.id === session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
      }

      // Check if another user already has this email
      const existingUser = globalStore.users.find(
        (u) => u.id !== user.id && u.email.toLowerCase() === cleanEmail
      );
      if (existingUser) {
        return NextResponse.json(
          { error: 'This email address is already in use by another account' },
          { status: 409 }
        );
      }

      // If user is linked to a client, update client email too
      if (user.clientId) {
        const client = globalStore.clients.find((c) => c.id === user.clientId);
        if (client) {
          client.email = cleanEmail;
        }
      }

      user.email = cleanEmail;
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (phone && phone.trim()) {
      user.phone = phone.trim();
    }

    globalStore.saveToFile();

    // Re-issue updated JWT token with new email
    const updatedPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      clientId: user.clientId,
    };
    const newToken = await signAuthToken(updatedPayload);

    const response = NextResponse.json({
      success: true,
      user: updatedPayload,
      message: 'Account profile and email updated successfully!',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('Failed to update user profile:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
