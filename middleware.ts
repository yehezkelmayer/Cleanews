import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'cnsid';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * On the first request from any browser, mint a UUID session ID and
 * park it in the `cnsid` cookie. Every DB row keyed by session_id ties
 * back to this cookie value — no login, no signup, but each visitor
 * gets a private workspace tied to their browser.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;
  if (existing && UUID.test(existing)) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return response;
}

export const config = {
  // Skip static assets and the cron endpoint (which is auth'd by CRON_SECRET
  // and doesn't need a per-user cookie).
  matcher: [
    '/((?!api/cron|_next/static|_next/image|favicon.ico).*)',
  ],
};
