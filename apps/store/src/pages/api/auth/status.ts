/**
 * GET /api/auth/status — the login page polls this while the customer sends
 * the WhatsApp message. When the bot has confirmed it, the browser is logged in.
 */
import type { APIRoute } from 'astro';
import { completeLogin, loginStatus } from '@maya/db';
import { clearCookie, db, json, LOGIN_COOKIE, setSessionCookie } from '../../../lib/session';

export const GET: APIRoute = async ({ cookies, request }) => {
  const secret = cookies.get(LOGIN_COOKIE)?.value ?? '';
  const d = db();
  const state = await loginStatus(d, secret);
  if (state.status !== 'verified') return json({ status: state.status });

  const session = await completeLogin(d, { requestId: state.requestId, phone: state.phone, userAgent: request.headers.get('User-Agent') });
  if (!session) return json({ status: 'expired' });
  setSessionCookie(cookies, session.token, session.expiresAt);
  clearCookie(cookies, LOGIN_COOKIE);
  return json({ status: 'done', needsName: !session.customer.name });
};
