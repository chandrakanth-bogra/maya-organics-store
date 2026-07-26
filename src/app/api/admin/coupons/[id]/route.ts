import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const update: Partial<typeof coupons.$inferInsert> = {};
  if (body.code !== undefined) update.code = body.code.toUpperCase();
  if (body.discount_type !== undefined) update.discountType = body.discount_type;
  if (body.value !== undefined) update.value = body.value;
  if (body.min_order_amount !== undefined) update.minOrderAmount = body.min_order_amount;
  if (body.usage_limit !== undefined) update.usageLimit = body.usage_limit;
  if (body.expires_at !== undefined) update.expiresAt = body.expires_at || null;
  if (body.active !== undefined) update.active = body.active;

  await db.update(coupons).set(update).where(eq(coupons.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await db.delete(coupons).where(eq(coupons.id, id));

  return NextResponse.json({ ok: true });
}
