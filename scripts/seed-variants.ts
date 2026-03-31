/**
 * Seed product_variants into Supabase.
 * Run: npx tsx scripts/seed-variants.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Pack sizes are placeholder (225g pouch) — update from admin panel.
 * Prices are placeholder (₹99 = 9900 paise) — update from admin panel.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, slug");

  if (fetchError || !products) {
    console.error("Failed to fetch products:", fetchError?.message);
    process.exit(1);
  }

  const slugToId: Record<string, string> = {};
  for (const p of products) {
    slugToId[p.slug] = p.id;
  }

  // Build all variant rows
  const variants: {
    product_id: string;
    grain_size: string | null;
    pack_size: string;
    price: number;
    in_stock: boolean;
    sort_order: number;
  }[] = [];

  for (const [slug, defs] of Object.entries(variantsBySlug)) {
    const productId = slugToId[slug];
    if (!productId) {
      console.warn(`Product not found for slug: ${slug} — skipping`);
      continue;
    }
    for (const def of defs) {
      variants.push({ product_id: productId, ...def, in_stock: true });
    }
  }

  console.log(`Seeding ${variants.length} variants...`);

  // Clear existing variants for all seeded products, then re-insert
  const productIds = Object.values(slugToId).filter(Boolean);
  const { error: deleteError } = await supabase
    .from("product_variants")
    .delete()
    .in("product_id", productIds);

  if (deleteError) {
    console.error("Failed to clear existing variants:", deleteError.message);
    process.exit(1);
  }

  const { error } = await supabase.from("product_variants").insert(variants);

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log("Done! Variants seeded successfully.");
}

seed();
