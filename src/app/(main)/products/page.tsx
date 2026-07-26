import { PRODUCTS } from "@/data/products";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products — Maya Organics",
  description:
    "Premium perlite, vermiculite, pumice, LECA, zeolite, cocopeat, vermicompost and neem cake for home gardeners and professional growers across India.",
};

export interface Product {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  image_main: string;
  price: number;
  price_unit: string;
  in_stock: boolean;
}

export default async function ProductsPage() {
  const db = getDb();
  // Fetch only prices + stock from DB (content comes from static file)
  const rows = await db
    .select({
      slug: products.slug,
      price: products.price,
      priceUnit: products.priceUnit,
      inStock: products.inStock,
    })
    .from(products);

  const dbMap = new Map(rows.map((r) => [r.slug, r]));

  const productList: Product[] = PRODUCTS.map((p) => {
    const row = dbMap.get(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      image_main: p.image_main,
      price: row?.price ?? 9900,
      price_unit: row?.priceUnit ?? "225g",
      in_stock: row?.inStock ?? true,
    };
  });

  return <ProductsClient products={productList} />;
}
