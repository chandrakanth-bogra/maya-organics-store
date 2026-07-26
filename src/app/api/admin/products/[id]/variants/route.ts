import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .orderBy(asc(productVariants.sortOrder));

  return NextResponse.json({ variants });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  if (!body.pack_size || !body.price) {
    return NextResponse.json({ error: "Pack size and price are required." }, { status: 400 });
  }

  await db.insert(productVariants).values({
    productId: id,
    grainSize: body.grain_size || null,
    packSize: body.pack_size,
    price: body.price,
    inStock: body.in_stock ?? true,
    sortOrder: body.sort_order ?? 0,
  });

  return NextResponse.json({ ok: true });
}
