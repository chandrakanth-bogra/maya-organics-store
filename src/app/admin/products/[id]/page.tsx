import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";
import ProductEditClient from "./ProductEditClient";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const db = getDb();
  const { id } = await params;

  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) notFound();

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .orderBy(asc(productVariants.sortOrder));

  return <ProductEditClient product={product} variants={variants} />;
}
