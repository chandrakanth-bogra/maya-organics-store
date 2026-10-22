/** Cookies for login and sessions. */
import type { AstroCookies } from 'astro';
import { env } from 'cloudflare:workers';
import { getDb, LOGIN_TTL_MIN } from '@maya/db';

/** __Host-: only sent to this exact host over HTTPS, path "/". */
export const SESSION_COOKIE = '__Host-mo_session';
/** Ties a login in progress to the browser that started it. */
export const LOGIN_COOKIE = '__Host-mo_login';

export const db = () => getDb(env.DB);

const base = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' };

export function setSessionCookie(cookies: AstroCookies, token: string, expires: Date) {
  cookies.set(SESSION_COOKIE, token, { ...base, expires });
}

export function setLoginCookie(cookies: AstroCookies, secret: string) {
  cookies.set(LOGIN_COOKIE, secret, { ...base, maxAge: LOGIN_TTL_MIN * 60 });
}

export const clearCookie = (cookies: AstroCookies, name: string) => cookies.delete(name, { path: '/' });

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
