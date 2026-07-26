import { NextResponse } from "next/server";
import { eq, desc, asc, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { addresses } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, auth.user.id))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));

  return NextResponse.json({
    addresses: rows.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      is_default: a.isDefault,
    })),
  });
}

export async function POST(req: Request) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  if (!body.line1 || !body.city || !body.state || !body.pincode) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const existing = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(eq(addresses.userId, auth.user.id));

  await db.insert(addresses).values({
    userId: auth.user.id,
    label: body.label || "Home",
    line1: body.line1,
    line2: body.line2 || null,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    isDefault: existing.length === 0,
  });

  return NextResponse.json({ ok: true });
}
