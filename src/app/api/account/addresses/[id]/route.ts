import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { addresses } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  if (body.is_default) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, auth.user.id));
    await db
      .update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, id), eq(addresses.userId, auth.user.id)));
    return NextResponse.json({ ok: true });
  }

  await db
    .update(addresses)
    .set({
      label: body.label,
      line1: body.line1,
      line2: body.line2 || null,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
    })
    .where(and(eq(addresses.id, id), eq(addresses.userId, auth.user.id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, auth.user.id)));

  return NextResponse.json({ ok: true });
}
