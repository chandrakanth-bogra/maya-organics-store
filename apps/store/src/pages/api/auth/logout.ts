/** POST /api/auth/logout — ends this browser's session. */
import type { APIRoute } from 'astro';
import { endSession } from '@maya/db';
import { clearCookie, db, json, SESSION_COOKIE } from '../../../lib/session';

export const POST: APIRoute = async ({ cookies }) => {
  await endSession(db(), cookies.get(SESSION_COOKIE)?.value);
  clearCookie(cookies, SESSION_COOKIE);
  return json({ ok: true });
};
