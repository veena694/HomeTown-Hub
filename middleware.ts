import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'hometown_session';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  return new TextEncoder().encode(secret || 'hometown_hub_secure_jwt_secret_key_2026_roots_connected');
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Routes Server-Side
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    try {
      const verified = await jwtVerify(token, getSecret());
      const payload = verified.payload as { role?: string };
      if (payload.role !== 'PLATFORM_ADMIN' && payload.role !== 'COMMUNITY_ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
