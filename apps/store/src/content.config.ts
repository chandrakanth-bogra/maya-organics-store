import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Product copy (descriptions, highlights, specs, FAQs) lives here in Markdown,
 * versioned in git. Names, sizes, prices and stock come from D1 (`@maya/db`),
 * joined by slug (file name = product slug).
 */
const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    highlights: z.array(z.string()).default([]),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    usage: z.string().optional(),
    gallery: z.array(z.string()).min(1),
    texture: z.string().default('default'),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

/** How-to guides and ingredient explainers (prerendered; link to products by slug). */
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    category: z.string(),
    readMinutes: z.number().int().positive(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    products: z.array(z.string()).default([]),
  }),
});

export const collections = { products, guides };
