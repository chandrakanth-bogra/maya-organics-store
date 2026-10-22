/** Small helpers shared by login and orders (Web Crypto: works in Workers and Node). */

/** Indian mobile number → "91XXXXXXXXXX", or null. Accepts +91, 0 and spaces/dashes. */
export function normalizePhone(input: string): string | null {
  let d = String(input || '').replace(/[^\d]/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? `91${d}` : null;
}

/** "919876543210" → "+91 98765 43210" */
export const formatPhone = (p: string) => `+${p.slice(0, 2)} ${p.slice(2, 7)} ${p.slice(7)}`;

export async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Random string from an alphabet, without modulo bias. */
export function randomString(length: number, alphabet: string): string {
  const out: string[] = [];
  const limit = 256 - (256 % alphabet.length);
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < limit) out.push(alphabet[b % alphabet.length]);
      if (out.length === length) break;
    }
  }
  return out.join('');
}

/** Easy to read and type: no 0/O, 1/I/L. */
export const READABLE = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** 256-bit URL-safe secret for cookies. */
export const randomToken = () => randomString(43, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');

export const randomDigits = (n: number) => randomString(n, '0123456789');

export const newId = () => crypto.randomUUID();

/** Constant-time comparison of two hex digests. */
export function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);
