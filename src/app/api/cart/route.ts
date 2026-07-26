import { NextResponse } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, auth.user.id),
    orderBy: asc(cartItems.createdAt),
    with: {
      variant: {
        columns: { grainSize: true, packSize: true, price: true, inStock: true },
        with: {
          product: {
            columns: { name: true, slug: true, imageThumb: true },
          },
        },
      },
    },
  });

  const items = rows.map((row) => ({
    id: row.id,
    variant_id: row.variantId,
    quantity: row.quantity,
    variant: {
      grain_size: row.variant.grainSize,
      pack_size: row.variant.packSize,
      price: row.variant.price,
      in_stock: row.variant.inStock,
      product: {
        name: row.variant.product.name,
        slug: row.variant.product.slug,
        image_thumb: row.variant.product.imageThumb,
      },
    },
  }));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { variantId, qty = 1 } = await req.json();
  if (!variantId) {
    return NextResponse.json({ error: "variantId is required" }, { status: 400 });
  }

  const existing = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.userId, auth.user.id), eq(cartItems.variantId, variantId)),
  });

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + qty })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({ userId: auth.user.id, variantId, quantity: qty });
  }

  return NextResponse.json({ ok: true });
}
