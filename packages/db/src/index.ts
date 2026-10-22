/**
 * Catalogue queries shared by the store and admin apps.
 */
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { and, asc, eq } from 'drizzle-orm';
import * as schema from './schema';
import type { ProductWithVariants, Variant } from './schema';

export * from './schema';

export type Db = DrizzleD1Database<typeof schema>;

export function getDb(d1: D1Database): Db {
  return drizzle(d1, { schema });
}

/** Active products with their active variants, in display order. */
export function listProducts(db: Db): Promise<ProductWithVariants[]> {
  return db.query.products.findMany({
    where: eq(schema.products.active, true),
    orderBy: [asc(schema.products.sortOrder), asc(schema.products.name)],
    with: {
      variants: {
        where: eq(schema.variants.active, true),
        orderBy: [asc(schema.variants.sortOrder)],
      },
    },
  });
}

export async function getProduct(db: Db, slug: string): Promise<ProductWithVariants | null> {
  const row = await db.query.products.findFirst({
    where: and(eq(schema.products.slug, slug), eq(schema.products.active, true)),
    with: {
      variants: {
        where: eq(schema.variants.active, true),
        orderBy: [asc(schema.variants.sortOrder)],
      },
    },
  });
  return row ?? null;
}

/** Lowest in-stock price (paise), or the lowest price when everything is out of stock. */
export function fromPrice(variants: Variant[]): number | null {
  const inStock = variants.filter((v) => v.inStock);
  const pool = inStock.length ? inStock : variants;
  return pool.length ? Math.min(...pool.map((v) => v.price)) : null;
}

export function isAvailable(p: ProductWithVariants): boolean {
  return p.variants.some((v) => v.inStock);
}

export * from './util';
export * from './auth';
export * from './orders';
export * from './customers';
