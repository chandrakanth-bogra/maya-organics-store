import { env } from 'cloudflare:workers';

export type CodeChannel = 'whatsapp_code' | 'sms';

/** Typed-code login channels switched on in wrangler.jsonc (LOGIN_CODE_CHANNELS). */
export const codeChannels = (): CodeChannel[] =>
  String(env.LOGIN_CODE_CHANNELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is CodeChannel => s === 'whatsapp_code' || s === 'sms');

/** Only same-site paths are allowed after login (no open redirects). */
export const safeNext = (next: string | null | undefined): string =>
  next && /^\/(?![/\\])/.test(next) ? next : '/account';
