import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const { quantity } = await req.json();
  if (typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "quantity must be a positive number" }, { status: 400 });
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, id), eq(cartItems.userId, auth.user.id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, auth.user.id)));

  return NextResponse.json({ ok: true });
}
