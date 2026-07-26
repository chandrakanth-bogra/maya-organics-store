import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { volumeDiscounts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

function toJson(d: typeof volumeDiscounts.$inferSelect) {
  return {
    id: d.id,
    min_order_amount: d.minOrderAmount,
    discount_percent: d.discountPercent,
    label: d.label,
  };
}

export async function GET() {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const rows = await db.select().from(volumeDiscounts).orderBy(asc(volumeDiscounts.minOrderAmount));
  return NextResponse.json({ discounts: rows.map(toJson) });
}

export async function POST(req: Request) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  if (!body.min_order_amount || !body.discount_percent) {
    return NextResponse.json({ error: "Min order and discount percent are required." }, { status: 400 });
  }

  await db.insert(volumeDiscounts).values({
    minOrderAmount: body.min_order_amount,
    discountPercent: body.discount_percent,
    label: body.label || null,
  });

  return NextResponse.json({ ok: true });
}
