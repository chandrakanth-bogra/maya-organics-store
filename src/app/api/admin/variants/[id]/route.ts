import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const update: Partial<typeof productVariants.$inferInsert> = {};
  if (body.grain_size !== undefined) update.grainSize = body.grain_size || null;
  if (body.pack_size !== undefined) update.packSize = body.pack_size;
  if (body.price !== undefined) update.price = body.price;
  if (body.in_stock !== undefined) update.inStock = body.in_stock;
  if (body.sort_order !== undefined) update.sortOrder = body.sort_order;

  await db.update(productVariants).set(update).where(eq(productVariants.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await db.delete(productVariants).where(eq(productVariants.id, id));

  return NextResponse.json({ ok: true });
}
