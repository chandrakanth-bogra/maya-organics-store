import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      user:users(name, email, phone),
      items:order_items(
        id, quantity, price_at_purchase,
        variant:product_variants(grain_size, pack_size, product:products(name, slug))
      )
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
