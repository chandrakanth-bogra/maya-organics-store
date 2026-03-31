import { createAdminClient } from "@/lib/supabase-admin";
import DiscountsClient from "./DiscountsClient";

export const revalidate = 0;

export default async function AdminDiscountsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("volume_discounts").select("*").order("min_order_amount");
  return <DiscountsClient initialDiscounts={data ?? []} />;
}
