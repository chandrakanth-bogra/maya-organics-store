import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await req.json();

  await db
    .update(products)
    .set({
      name: body.name,
      category: body.category,
      tagline: body.tagline || null,
      metaDescription: body.meta_description || null,
      price: body.price,
      priceUnit: body.price_unit,
      imageMain: body.image_main || null,
      imageThumb: body.image_thumb || null,
      usageNote: body.usage_note || null,
      textureClass: body.texture_class,
      hasSizeGuide: body.has_size_guide,
      inStock: body.in_stock,
      highlights: body.highlights,
      specs: body.specs,
    })
    .where(eq(products.id, id));

  return NextResponse.json({ ok: true });
}
