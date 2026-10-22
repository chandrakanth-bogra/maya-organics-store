/**
 * Search engines and AI agents are welcome: the store wants to be found,
 * quoted and bought from. Content-Signal states how the content may be used
 * (https://contentsignals.org).
 */
import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    [
      '# Maya Organics — soil amendments and growing media',
      'User-agent: *',
      'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
      'Allow: /',
      'Disallow: /cart',
      'Disallow: /checkout',
      'Disallow: /account',
      'Disallow: /api/',
      '',
      `Sitemap: ${SITE.url}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
