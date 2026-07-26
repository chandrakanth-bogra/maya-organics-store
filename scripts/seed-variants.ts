/**
 * Seed product_variants into the local SQLite database.
 * Run: npx tsx scripts/seed-variants.ts
 *
 * Pack sizes are placeholder (225g pouch) — update from admin panel.
 * Prices are placeholder (₹99 = 9900 paise) — update from admin panel.
 */
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";

// Variant definitions per product slug.
// grain_size: null for non-granular products (cocopeat, vermicompost, neem-cake).
// pack_size: placeholder — update from admin panel.
// price: in paise — placeholder ₹99 = 9900.
const variantsBySlug: Record<
  string,
  { grain_size: string | null; pack_size: string; price: number; sort_order: number }[]
> = {
  perlite: [
    { grain_size: "3–8mm", pack_size: "225g pouch", price: 9900, sort_order: 1 },
  ],
  vermiculite: [
    { grain_size: "2–6mm", pack_size: "225g pouch", price: 9900, sort_order: 1 },
    { grain_size: "6–10mm", pack_size: "225g pouch", price: 9900, sort_order: 2 },
  ],
  pumice: [
    { grain_size: "2–4mm", pack_size: "225g pouch", price: 9900, sort_order: 1 },
    { grain_size: "4–6mm", pack_size: "225g pouch", price: 9900, sort_order: 2 },
    { grain_size: "6–10mm", pack_size: "225g pouch", price: 9900, sort_order: 3 },
  ],
  leca: [
    { grain_size: "8–15mm", pack_size: "225g pouch", price: 9900, sort_order: 1 },
    { grain_size: "15–30mm", pack_size: "225g pouch", price: 9900, sort_order: 2 },
  ],
  zeolite: [
    { grain_size: "2–4mm", pack_size: "225g pouch", price: 9900, sort_order: 1 },
  ],
  cocopeat: [
    { grain_size: null, pack_size: "225g pouch", price: 9900, sort_order: 1 },
  ],
  vermicompost: [
    { grain_size: null, pack_size: "225g pouch", price: 9900, sort_order: 1 },
  ],
  "neem-cake": [
    { grain_size: null, pack_size: "225g pouch", price: 9900, sort_order: 1 },
  ],
};

async function seed() {
  // Fetch all products to get their IDs
  const rows = await db.select({ id: products.id, slug: products.slug }).from(products);

  const slugToId: Record<string, string> = {};
  for (const p of rows) {
    slugToId[p.slug] = p.id;
  }

  // Build all variant rows
  const variants: {
    productId: string;
    grainSize: string | null;
    packSize: string;
    price: number;
    inStock: boolean;
    sortOrder: number;
  }[] = [];

  for (const [slug, defs] of Object.entries(variantsBySlug)) {
    const productId = slugToId[slug];
    if (!productId) {
      console.warn(`Product not found for slug: ${slug} — skipping`);
      continue;
    }
    for (const def of defs) {
      variants.push({
        productId,
        grainSize: def.grain_size,
        packSize: def.pack_size,
        price: def.price,
        sortOrder: def.sort_order,
        inStock: true,
      });
    }
  }

  console.log(`Seeding ${variants.length} variants...`);

  // Clear existing variants for all seeded products, then re-insert
  const productIds = Object.values(slugToId).filter(Boolean);
  if (productIds.length) {
    await db.delete(productVariants).where(inArray(productVariants.productId, productIds));
  }

  if (variants.length) {
    await db.insert(productVariants).values(variants);
  }

  console.log("Done! Variants seeded successfully.");
}

seed();
