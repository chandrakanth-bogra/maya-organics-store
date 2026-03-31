import { createAdminClient } from "@/lib/supabase-admin";
import CouponsClient from "./CouponsClient";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return <CouponsClient initialCoupons={coupons ?? []} />;
}
