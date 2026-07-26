import { redirect } from "next/navigation";
import { eq, asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { addresses, volumeDiscounts } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — Maya Organics" };

export default async function CheckoutPage() {
  const db = getDb();
  const session = await getSession();
  if (!session?.user) redirect("/auth/login?next=/checkout");

  const userAddresses = (
    await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, session.user.id))
      .orderBy(desc(addresses.isDefault))
  ).map((a) => ({
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    is_default: a.isDefault,
  }));

  const tiers = await db
    .select({
      min_order_amount: volumeDiscounts.minOrderAmount,
      discount_percent: volumeDiscounts.discountPercent,
      label: volumeDiscounts.label,
    })
    .from(volumeDiscounts)
    .orderBy(asc(volumeDiscounts.minOrderAmount));

  return <CheckoutClient savedAddresses={userAddresses} volumeTiers={tiers} />;
}
