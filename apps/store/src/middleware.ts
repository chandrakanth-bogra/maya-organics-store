/**
 * Runs before every on-demand page and API call:
 *  - loads the logged-in customer (Astro.locals.customer)
 *  - sends visitors who are not logged in from /account and /checkout to /login
 *  - refuses form posts and API changes from other sites (CSRF)
 *  - adds security headers
 */
import { defineMiddleware } from 'astro:middleware';
import { customerForSession } from '@maya/db';
import { db, SESSION_COOKIE } from './lib/session';

const PROTECTED = /^\/(account|checkout)(\/|$)/;

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.customer = null;
  if (ctx.isPrerendered) return next();

  const { pathname } = ctx.url;
  const method = ctx.request.method;

  // Any form post or API change must come from this site (browsers always send Origin on POST).
  if (method !== 'GET' && method !== 'HEAD') {
    const origin = URL.parse(ctx.request.headers.get('Origin') ?? '');
    if (!origin || origin.host !== ctx.url.host) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  }

  const token = ctx.cookies.get(SESSION_COOKIE)?.value;
  if (token) ctx.locals.customer = await customerForSession(db(), token);

  if (PROTECTED.test(pathname) && !ctx.locals.customer) {
    return ctx.redirect(`/login?next=${encodeURIComponent(pathname + ctx.url.search)}`);
  }

  const res = await next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  // The workers.dev test address must never be indexed.
  if (ctx.url.hostname.endsWith('.workers.dev')) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (ctx.locals.customer || PROTECTED.test(pathname) || pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'private, no-store');
  }
  return res;
});
