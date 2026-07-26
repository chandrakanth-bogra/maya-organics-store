import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminPage();
  const db = getDb();

  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  const initialCoupons = rows.map((c) => ({
    id: c.id,
    code: c.code,
    discount_type: c.discountType,
    value: c.value,
    min_order_amount: c.minOrderAmount,
    usage_limit: c.usageLimit,
    used_count: c.usedCount,
    expires_at: c.expiresAt,
    active: c.active,
  }));

  return <CouponsClient initialCoupons={initialCoupons} />;
}
