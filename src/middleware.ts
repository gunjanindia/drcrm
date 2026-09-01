import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'digital_ranchi_os_super_secret_jwt_signing_key_32_chars'
);

const AUTH_COOKIE_NAME = 'dr_auth_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // 1. Protect Agency CRM Routes (/app, /app/*)
  if (pathname === '/app' || pathname.startsWith('/app/')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Clients cannot access agency CRM
    if (session.role === 'CLIENT') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  // 2. Protect Client Portal Routes (/portal, /portal/*)
  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. If already authenticated and accessing /login, redirect to destination
  if (pathname === '/login') {
    if (session) {
      if (session.role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal', request.url));
      } else {
        return NextResponse.redirect(new URL('/app', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/portal/:path*', '/login'],
};
