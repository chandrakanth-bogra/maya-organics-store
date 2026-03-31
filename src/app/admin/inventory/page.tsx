import { createAdminClient } from "@/lib/supabase-admin";
import InventoryClient from "./InventoryClient";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("product_variants")
    .select("id, grain_size, pack_size, price, in_stock, sort_order, product:products(id, name, slug)")
    .order("sort_order");

  // Group by product
  const grouped: Record<string, { product: { id: string; name: string; slug: string }; variants: any[] }> = {};
  for (const v of data ?? []) {
    const p = v.product as any;
    if (!grouped[p.id]) grouped[p.id] = { product: p, variants: [] };
    grouped[p.id].variants.push(v);
  }

  return <InventoryClient groups={Object.values(grouped)} />;
}
