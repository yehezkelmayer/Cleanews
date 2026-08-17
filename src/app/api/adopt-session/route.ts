import { NextRequest, NextResponse } from 'next/server';
import { isValidSessionId, SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Set the `cnsid` cookie to a specific UUID (typically the one printed by
 * the migration script). Because the UUID *is* the credential, anyone
 * who knows the UUID can adopt that session — but 128 bits is not
 * meaningfully guessable, so this is safe for the owner-recovery flow.
 *
 *   GET /api/adopt-session?token=<uuid>[&next=/settings]
 */
function handle(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  if (!isValidSessionId(token)) {
    return NextResponse.json({ error: 'invalid or missing token' }, { status: 400 });
  }
  const next = req.nextUrl.searchParams.get('next') ?? '/';
  const dest = next.startsWith('/') ? next : '/';

  const response = NextResponse.redirect(new URL(dest, req.url));
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}

export const GET = handle;
export const POST = handle;
