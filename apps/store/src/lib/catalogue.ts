/**
 * Joins the live catalogue (D1: names, sizes, prices, stock) with the product
 * copy (Markdown content collection) for pages.
 */
import { env } from 'cloudflare:workers';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { getDb, listProducts, getProduct, type ProductWithVariants } from '@maya/db';

export type CatalogueProduct = ProductWithVariants & { copy: CollectionEntry<'products'> };

const db = () => getDb(env.DB);

export async function loadCatalogue(): Promise<CatalogueProduct[]> {
  const [rows, entries] = await Promise.all([listProducts(db()), getCollection('products')]);
  const copy = new Map(entries.map((e) => [e.id, e]));
  // A product needs both a DB row (to be sold) and copy (to be described).
  return rows.flatMap((p) => (copy.has(p.slug) ? [{ ...p, copy: copy.get(p.slug)! }] : []));
}

export async function loadProduct(slug: string): Promise<CatalogueProduct | null> {
  const [row, entry] = await Promise.all([getProduct(db(), slug), getEntry('products', slug)]);
  return row && entry ? { ...row, copy: entry } : null;
}

// Product photos live in src/assets/images so Astro can resize and convert them.
const images = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

export function productImage(file: string): ImageMetadata {
  const hit = images[`../assets/images/${file}`];
  if (!hit) throw new Error(`Missing product image: ${file}`);
  return hit.default;
}
