import { PRODUCTS } from "@/data/products";
import { supabase } from "@/lib/supabase";
import ProductsClient from "./ProductsClient";

export const revalidate = 3600;

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
  // Fetch only prices + stock from Supabase (content comes from static file)
  const { data } = await supabase
    .from("products")
    .select("slug, price, price_unit, in_stock");

  const dbMap = new Map((data ?? []).map((r) => [r.slug, r]));

  const products: Product[] = PRODUCTS.map((p) => {
    const db = dbMap.get(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      category: p.category,
      tagline: p.tagline,
      image_main: p.image_main,
      price: db?.price ?? 9900,
      price_unit: db?.price_unit ?? "225g",
      in_stock: db?.in_stock ?? true,
    };
  });

  return <ProductsClient products={products} />;
}
