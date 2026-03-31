import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Checkout — Maya Organics" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/checkout");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  const { data: tiers } = await supabase
    .from("volume_discounts")
    .select("min_order_amount, discount_percent, label")
    .order("min_order_amount");

  return <CheckoutClient savedAddresses={addresses ?? []} volumeTiers={tiers ?? []} />;
}
