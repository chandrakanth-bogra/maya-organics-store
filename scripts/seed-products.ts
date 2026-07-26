/**
 * Seed products from src/data/products.ts into the local SQLite database.
 * Run: npx tsx scripts/seed-products.ts
 *
 * Price is placeholder (₹99 = 9900 paise) — update from admin panel.
 */
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { PRODUCTS } from "@/data/products";

const PLACEHOLDER_PRICE = 9900; // ₹99 in paise

async function seed() {
  const rows = PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    metaDescription: p.meta_description,
    price: PLACEHOLDER_PRICE,
    priceUnit: "225g pouch",
    imageMain: p.image_main,
    imageThumb: p.image_thumb ?? p.image_main,
    highlights: p.highlights,
    specs: p.specs,
    usageNote: p.usage_note,
    textureClass: p.texture_class,
    hasSizeGuide: p.has_size_guide,
    inStock: true,
    stock: 999,
  }));

  console.log(`Seeding ${rows.length} products...`);

  for (const row of rows) {
    await db
      .insert(products)
      .values(row)
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: row.name,
          category: row.category,
          tagline: row.tagline,
          metaDescription: row.metaDescription,
          price: row.price,
          priceUnit: row.priceUnit,
          imageMain: row.imageMain,
          imageThumb: row.imageThumb,
          highlights: row.highlights,
          specs: row.specs,
          usageNote: row.usageNote,
          textureClass: row.textureClass,
          hasSizeGuide: row.hasSizeGuide,
        },
      });
  }

  console.log("Done! Products seeded successfully.");
}

seed();
