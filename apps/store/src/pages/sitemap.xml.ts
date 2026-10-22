/**
 * Sitemap built from the live catalogue and the guides, so new or retired
 * products show up without a rebuild. (Astro's sitemap integration cannot see
 * pages rendered on request.)
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { env } from 'cloudflare:workers';
import { getDb, listProducts } from '@maya/db';
import { SITE } from '../lib/site';

const STATIC = ['/', '/products', '/guides', '/about', '/contact', '/privacy'];

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async () => {
  const [products, guides] = await Promise.all([listProducts(getDb(env.DB)), getCollection('guides')]);

  const urls: { loc: string; lastmod?: string }[] = [
    ...STATIC.map((p) => ({ loc: p })),
    ...products.map((p) => {
      const latest = [p.updatedAt, ...p.variants.map((v) => v.updatedAt)].sort().at(-1);
      return { loc: `/products/${p.slug}`, lastmod: latest?.slice(0, 10) };
    }),
    ...guides.map((g) => ({
      loc: `/guides/${g.id}`,
      lastmod: (g.data.updated ?? g.data.published).toISOString().slice(0, 10),
    })),
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${xmlEscape(SITE.url + (u.loc === '/' ? '/' : u.loc))}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
