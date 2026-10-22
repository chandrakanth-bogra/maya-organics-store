/**
 * Phone login and sessions.
 *
 * "Continue with WhatsApp": we show a short code; the customer sends it to our
 * WhatsApp from the number they entered. The bot (same database) checks the
 * sender and sets verified_at. The browser that started the login (it holds a
 * secret whose hash is browser_hash) then gets a session.
 *
 * "whatsapp_code" / "sms": we send a 6-digit code; the customer types it here.
 */
import { and, eq, gt, gte, isNull, sql } from 'drizzle-orm';
import type { Db } from './index';
import { customers, loginRequests, sessions, type Customer } from './schema';
import { addMinutes, newId, randomDigits, randomString, randomToken, READABLE, sameHex, sha256Hex } from './util';

export const LOGIN_TTL_MIN = 10;
export const MAX_CODE_ATTEMPTS = 5;
export const MAX_REQUESTS_PER_PHONE_PER_HOUR = 5;
export const SESSION_DAYS = 60;

export type LoginMethod = 'whatsapp' | 'whatsapp_code' | 'sms';

/** The text the customer sends on WhatsApp. The bot matches it with WHATSAPP_LOGIN_PATTERN. */
export const whatsappLoginText = (code: string) => `Maya Organics login code: ${code}`;
export const WHATSAPP_LOGIN_PATTERN = /login code:?\s*([2-9A-HJKMNP-Z]{6})\b/i;

export async function recentRequestCount(db: Db, phone: string, now = new Date()): Promise<number> {
  const since = new Date(now.getTime() - 3600_000).toISOString();
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(loginRequests)
    .where(and(eq(loginRequests.phone, phone), gte(loginRequests.createdAt, since)));
  return Number(row?.n ?? 0);
}

/**
 * Start a login. Returns the code to show (WhatsApp) or send (OTP), and the
 * browser secret to put in a short-lived cookie.
 */
export async function startLogin(db: Db, { phone, method, ip, now = new Date() }: { phone: string; method: LoginMethod; ip?: string | null; now?: Date }) {
  const code = method === 'whatsapp' ? randomString(6, READABLE) : randomDigits(6);
  const browserSecret = randomToken();
  const id = newId();
  await db.insert(loginRequests).values({
    id,
    phone,
    method,
    codeHash: await sha256Hex(code.toUpperCase()),
    browserHash: await sha256Hex(browserSecret),
    createdAt: now.toISOString(),
    expiresAt: addMinutes(now, LOGIN_TTL_MIN).toISOString(),
    ip: ip ?? null,
  });
  return { id, code, browserSecret };
}

async function openRequest(db: Db, browserSecret: string, now: Date) {
  if (!browserSecret) return null;
  const hash = await sha256Hex(browserSecret);
  const row = await db.query.loginRequests.findFirst({
    where: and(eq(loginRequests.browserHash, hash), isNull(loginRequests.usedAt), gt(loginRequests.expiresAt, now.toISOString())),
  });
  return row && sameHex(row.browserHash, hash) ? row : null;
}

export type LoginState = { status: 'pending' | 'expired' } | { status: 'verified'; requestId: string; phone: string };

/** Has the WhatsApp message arrived for this browser's login? */
export async function loginStatus(db: Db, browserSecret: string, now = new Date()): Promise<LoginState> {
  const row = await openRequest(db, browserSecret, now);
  if (!row) return { status: 'expired' };
  return row.verifiedAt ? { status: 'verified', requestId: row.id, phone: row.phone } : { status: 'pending' };
}

export type CodeResult = { ok: true; requestId: string; phone: string } | { ok: false; error: 'expired' | 'wrong_code' | 'too_many_attempts' };

/** Check a typed 6-digit code (whatsapp_code / sms). */
export async function verifyCode(db: Db, browserSecret: string, code: string, now = new Date()): Promise<CodeResult> {
  const row = await openRequest(db, browserSecret, now);
  if (!row || row.method === 'whatsapp') return { ok: false, error: 'expired' };
  if (row.attempts >= MAX_CODE_ATTEMPTS) return { ok: false, error: 'too_many_attempts' };
  await db.update(loginRequests).set({ attempts: sql`${loginRequests.attempts} + 1` }).where(eq(loginRequests.id, row.id));
  const hash = await sha256Hex(String(code).replace(/\s/g, ''));
  if (!sameHex(hash, row.codeHash)) return { ok: false, error: row.attempts + 1 >= MAX_CODE_ATTEMPTS ? 'too_many_attempts' : 'wrong_code' };
  await db.update(loginRequests).set({ verifiedAt: now.toISOString() }).where(eq(loginRequests.id, row.id));
  return { ok: true, requestId: row.id, phone: row.phone };
}

/**
 * Called by the bot when "login code: ABC123" arrives from `fromPhone`.
 * Only the number that started the login can confirm it.
 */
export async function confirmWhatsappLogin(db: Db, code: string, fromPhone: string, now = new Date()): Promise<'ok' | 'not_found' | 'wrong_number'> {
  const hash = await sha256Hex(code.toUpperCase());
  const row = await db.query.loginRequests.findFirst({
    where: and(
      eq(loginRequests.codeHash, hash),
      eq(loginRequests.method, 'whatsapp'),
      isNull(loginRequests.usedAt),
      gt(loginRequests.expiresAt, now.toISOString())
    ),
  });
  if (!row) return 'not_found';
  if (row.phone !== fromPhone) return 'wrong_number';
  if (!row.verifiedAt) await db.update(loginRequests).set({ verifiedAt: now.toISOString() }).where(eq(loginRequests.id, row.id));
  return 'ok';
}

/** Turn a verified login into a session: find or create the customer, mark the request used. */
export async function completeLogin(db: Db, { requestId, phone, userAgent, now = new Date() }: { requestId: string; phone: string; userAgent?: string | null; now?: Date }) {
  // Mark used first; if another tab already used it, stop.
  const used = await db
    .update(loginRequests)
    .set({ usedAt: now.toISOString() })
    .where(and(eq(loginRequests.id, requestId), isNull(loginRequests.usedAt)))
    .returning({ id: loginRequests.id });
  if (!used.length) return null;

  let customer = await db.query.customers.findFirst({ where: eq(customers.phone, phone) });
  if (!customer) {
    [customer] = await db.insert(customers).values({ id: newId(), phone, createdAt: now.toISOString() }).onConflictDoNothing().returning();
    customer ??= await db.query.customers.findFirst({ where: eq(customers.phone, phone) });
  }
  await db.update(customers).set({ lastLoginAt: now.toISOString() }).where(eq(customers.id, customer!.id));

  const token = randomToken();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({
    id: await sha256Hex(token),
    customerId: customer!.id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userAgent: userAgent?.slice(0, 200) ?? null,
  });
  return { token, expiresAt, customer: customer! };
}

export async function customerForSession(db: Db, token: string | undefined, now = new Date()): Promise<Customer | null> {
  if (!token) return null;
  const id = await sha256Hex(token);
  const row = await db.query.sessions.findFirst({ where: and(eq(sessions.id, id), gt(sessions.expiresAt, now.toISOString())) });
  if (!row) return null;
  return (await db.query.customers.findFirst({ where: eq(customers.id, row.customerId) })) ?? null;
}

export async function endSession(db: Db, token: string | undefined) {
  if (token) await db.delete(sessions).where(eq(sessions.id, await sha256Hex(token)));
}
