/** Calls to the WhatsApp bot over the service binding (private, plus the shared secret). */
import { env } from 'cloudflare:workers';

async function post(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  if (!env.LEAD_SECRET) return { ok: false, status: 0, data: { error: 'LEAD_SECRET not set' } };
  try {
    const res = await env.BOT.fetch(`https://bot${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-lead-secret': env.LEAD_SECRET },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.error(`bot ${path} failed`, res.status, JSON.stringify(data));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    console.error(`bot ${path} failed`, e);
    return { ok: false, status: 0, data: {} };
  }
}

/** Tell the team about a new order (the bot reads it from the database). */
export const notifyNewOrder = (orderId: string) => post('/store-order', { orderId });

/** Send a 6-digit login code by WhatsApp template or SMS. */
export const sendLoginCode = (phone: string, code: string, channel: 'whatsapp_code' | 'sms') =>
  post('/login-code', { phone, code, channel });
