/** POST /api/auth/verify { code } — typed 6-digit code (WhatsApp code or SMS). */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { completeLogin, verifyCode } from '@maya/db';
import { clearCookie, db, json, LOGIN_COOKIE, setSessionCookie } from '../../../lib/session';

const MESSAGES = {
  expired: 'This code has expired. Start again.',
  wrong_code: 'That code is not right. Check the message and try again.',
  too_many_attempts: 'Too many wrong codes. Start again.',
};

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = request.headers.get('CF-Connecting-IP') || clientAddress || null;
  if (!(await env.LOGIN_LIMIT.limit({ key: `verify:${ip}` })).success) return json({ error: 'Too many attempts. Wait a minute.' }, 429);

  const { code } = (await request.json().catch(() => ({}))) as { code?: unknown };
  const secret = cookies.get(LOGIN_COOKIE)?.value ?? '';
  const d = db();
  const r = await verifyCode(d, secret, String(code ?? ''));
  if (!r.ok) return json({ error: MESSAGES[r.error], expired: r.error !== 'wrong_code' }, 400);

  const session = await completeLogin(d, { requestId: r.requestId, phone: r.phone, userAgent: request.headers.get('User-Agent') });
  if (!session) return json({ error: MESSAGES.expired, expired: true }, 400);
  setSessionCookie(cookies, session.token, session.expiresAt);
  clearCookie(cookies, LOGIN_COOKIE);
  return json({ status: 'done', needsName: !session.customer.name });
};
