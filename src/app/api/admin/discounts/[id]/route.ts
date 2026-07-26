import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { volumeDiscounts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const update: Partial<typeof volumeDiscounts.$inferInsert> = {};
  if (body.min_order_amount !== undefined) update.minOrderAmount = body.min_order_amount;
  if (body.discount_percent !== undefined) update.discountPercent = body.discount_percent;
  if (body.label !== undefined) update.label = body.label || null;

  await db.update(volumeDiscounts).set(update).where(eq(volumeDiscounts.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await db.delete(volumeDiscounts).where(eq(volumeDiscounts.id, id));

  return NextResponse.json({ ok: true });
}
