// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mayaorganics.store',
  trailingSlash: 'never',
  // Pages are rendered on request (live prices); static pages opt in with `export const prerender = true`.
  output: 'server',
  adapter: cloudflare({
    imageService: { build: 'compile', runtime: 'cloudflare-binding' },
  }),
  session: false,
  integrations: [react(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
