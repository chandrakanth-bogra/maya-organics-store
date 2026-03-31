/**
 * Seed products from CSV into Supabase.
 * Run: npx tsx scripts/seed-products.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
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

function parsePrice(priceStr: string): number {
  // "₹99" → 9900 (paise)
  const num = parseInt(priceStr.replace(/[^\d]/g, ""));
  return num * 100;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function seed() {
  const csvPath = path.resolve(
    __dirname,
    "../../maya-organics-website/data/products.csv"
  );
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = parseCsvLine(lines[0]);

  const products = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));

    const highlights = [
      row.highlight_1, row.highlight_2, row.highlight_3,
      row.highlight_4, row.highlight_5, row.highlight_6,
    ].filter(Boolean);

    const specs = [
      { label: row.spec_1_label, value: row.spec_1_value },
      { label: row.spec_2_label, value: row.spec_2_value },
      { label: row.spec_3_label, value: row.spec_3_value },
      { label: row.spec_4_label, value: row.spec_4_value },
      { label: row.spec_5_label, value: row.spec_5_value },
      { label: row.spec_6_label, value: row.spec_6_value },
    ].filter((s) => s.label);

    return {
      slug: row.slug,
      name: row.name,
      category: row.category,
      tagline: row.tagline,
      meta_description: row.meta_description,
      price: parsePrice(row.price),
      price_unit: row.price_unit,
      image_main: row.image_main,
      image_thumb: row.image_thumb2 || row.image_main,
      highlights,
      specs,
      usage_note: row.usage_note,
      texture_class: row.texture_class,
      has_size_guide: row.has_size_guide === "true",
      in_stock: true,
      stock: 999,
    };
  });

  console.log(`Seeding ${products.length} products...`);

  const { error } = await supabase
    .from("products")
    .upsert(products, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log("Done! Products seeded successfully.");
}

seed();
