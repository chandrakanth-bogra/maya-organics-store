import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

function toJson(c: typeof coupons.$inferSelect) {
  return {
    id: c.id,
    code: c.code,
    discount_type: c.discountType,
    value: c.value,
    min_order_amount: c.minOrderAmount,
    usage_limit: c.usageLimit,
    used_count: c.usedCount,
    expires_at: c.expiresAt,
    active: c.active,
  };
}

export async function GET() {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: rows.map(toJson) });
}

export async function POST(req: Request) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  if (!body.code) return NextResponse.json({ error: "Code is required." }, { status: 400 });

  await db.insert(coupons).values({
    code: body.code.toUpperCase(),
    discountType: body.discount_type,
    value: body.value,
    minOrderAmount: body.min_order_amount ?? 0,
    usageLimit: body.usage_limit ?? null,
    expiresAt: body.expires_at || null,
    active: body.active ?? true,
  });

  return NextResponse.json({ ok: true });
}
