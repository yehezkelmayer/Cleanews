import { cookies } from 'next/headers';

const COOKIE = 'cnsid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Read the current session ID from the `cnsid` cookie. The middleware
 * guarantees this cookie exists on every non-cron request, so this
 * throws if it's missing — indicating a bug in the middleware config,
 * not a normal condition.
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value || !UUID.test(value)) {
    throw new Error(
      'Missing or invalid cnsid session cookie — middleware should have set it.',
    );
  }
  return value;
}

/** Same, but returns null instead of throwing. */
export async function tryGetSessionId(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!value || !UUID.test(value)) return null;
  return value;
}

export function isValidSessionId(v: string | undefined | null): v is string {
  return !!v && UUID.test(v);
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
