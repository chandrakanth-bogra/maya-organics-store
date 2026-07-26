import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { volumeDiscounts } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";
import DiscountsClient from "./DiscountsClient";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await requireAdminPage();
  const db = getDb();

  const rows = await db.select().from(volumeDiscounts).orderBy(asc(volumeDiscounts.minOrderAmount));

  const initialDiscounts = rows.map((d) => ({
    id: d.id,
    min_order_amount: d.minOrderAmount,
    discount_percent: d.discountPercent,
    label: d.label,
  }));

  return <DiscountsClient initialDiscounts={initialDiscounts} />;
}
