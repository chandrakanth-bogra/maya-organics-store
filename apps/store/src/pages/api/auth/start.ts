/**
 * POST /api/auth/start { phone, method, turnstile }
 * whatsapp      → { code, text, link }: the customer sends `text` to our WhatsApp
 * whatsapp_code → the bot sends a 6-digit code (needs an approved template)
 * sms           → the bot sends a 6-digit code by SMS
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { normalizePhone, recentRequestCount, startLogin, whatsappLoginText, MAX_REQUESTS_PER_PHONE_PER_HOUR, type LoginMethod } from '@maya/db';
import { db, json, setLoginCookie } from '../../../lib/session';
import { turnstileOk } from '../../../lib/turnstile';
import { sendLoginCode } from '../../../lib/bot';
import { whatsappLink } from '../../../lib/site';
import { codeChannels } from '../../../lib/login';

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = request.headers.get('CF-Connecting-IP') || clientAddress || null;
  const { success } = await env.LOGIN_LIMIT.limit({ key: `ip:${ip}` });
  if (!success) return json({ error: 'Too many attempts. Please wait a minute and try again.' }, 429);

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const phone = normalizePhone(String(body.phone ?? ''));
  if (!phone) return json({ error: 'Enter a 10-digit Indian mobile number.' }, 400);

  const method = String(body.method) as LoginMethod;
  if (method !== 'whatsapp' && !codeChannels().includes(method as never)) {
    return json({ error: 'That login option is not available yet.' }, 400);
  }
  if (!(await turnstileOk(body.turnstile, ip))) return json({ error: 'Please complete the check and try again.' }, 400);

  const d = db();
  if ((await recentRequestCount(d, phone)) >= MAX_REQUESTS_PER_PHONE_PER_HOUR) {
    return json({ error: 'Too many login attempts for this number. Please try again in an hour.' }, 429);
  }

  const { code, browserSecret } = await startLogin(d, { phone, method, ip });
  setLoginCookie(cookies, browserSecret);

  if (method === 'whatsapp') {
    const text = whatsappLoginText(code);
    return json({ method, code, text, link: whatsappLink(text) });
  }

  const sent = await sendLoginCode(phone, code, method);
  if (!sent.ok) return json({ error: 'We could not send the code. Try “Continue with WhatsApp” instead.' }, 502);
  return json({ method });
};
