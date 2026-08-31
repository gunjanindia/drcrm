import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUserSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
