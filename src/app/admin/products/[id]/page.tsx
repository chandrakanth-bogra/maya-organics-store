import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import ProductEditClient from "./ProductEditClient";

export const revalidate = 0;

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  return <ProductEditClient product={product} variants={variants ?? []} />;
}
