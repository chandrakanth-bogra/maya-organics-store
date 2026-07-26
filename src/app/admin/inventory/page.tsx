import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdminPage();
  const db = getDb();

  const rows = await db.query.productVariants.findMany({
    orderBy: asc(productVariants.sortOrder),
    columns: { id: true, grainSize: true, packSize: true, price: true, inStock: true },
    with: { product: { columns: { id: true, name: true, slug: true } } },
  });

  const grouped: Record<string, { product: { id: string; name: string; slug: string }; variants: { id: string; grain_size: string | null; pack_size: string; price: number; in_stock: boolean }[] }> = {};
  for (const v of rows) {
    const p = v.product;
    if (!grouped[p.id]) grouped[p.id] = { product: p, variants: [] };
    grouped[p.id].variants.push({
      id: v.id,
      grain_size: v.grainSize,
      pack_size: v.packSize,
      price: v.price,
      in_stock: v.inStock,
    });
  }

  return <InventoryClient groups={Object.values(grouped)} />;
}
