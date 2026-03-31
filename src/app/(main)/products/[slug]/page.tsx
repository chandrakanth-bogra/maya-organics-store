import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/data/products";
import { supabase } from "@/lib/supabase";
import ProductGallery from "./ProductGallery";
import BuyBox, { type Variant } from "./BuyBox";

export const revalidate = 3600;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

async function getVariants(slug: string): Promise<Variant[]> {
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .single();
  if (!product) return [];
  const { data } = await supabase
    .from("product_variants")
    .select("id, grain_size, pack_size, price, in_stock")
    .eq("product_id", product.id)
    .order("sort_order");
  return (data ?? []) as Variant[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Maya Organics`,
    description: product.meta_description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const variants = await getVariants(slug);

  return (
    <>
      {/* BREADCRUMB */}
      <div style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="container" style={{
          padding: "var(--space-3) 0",
          display: "flex", gap: "var(--space-2)", alignItems: "center",
          fontSize: "12px", fontWeight: 400, color: "var(--text-secondary)",
        }}>
          <Link href="/" style={{ color: "var(--text-secondary)" }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "var(--text-secondary)" }}>Products</Link>
          <span>/</span>
          <span style={{ color: "var(--green-dark)", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* 3-COLUMN PRODUCT LAYOUT */}
      <section className="section" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="container">
          <div className="product-detail-grid">

            {/* ① Gallery */}
            <ProductGallery
              mainImage={product.image_main}
              thumbImage={product.image_thumb}
              name={product.name}
            />

            {/* ② Product info — middle column */}
            <div>
              <span style={{
                display: "inline-block", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "var(--green-dark)",
              }}>
                {product.category}
              </span>

              <h1 style={{
                fontSize: "clamp(28px, 3vw, 36px)",
                color: "var(--text-primary)",
                marginBottom: "var(--space-3)",
                lineHeight: 1.1,
              }}>
                {product.name}
              </h1>

              <p style={{
                fontSize: "15px", fontWeight: 300,
                color: "var(--text-secondary)", lineHeight: 1.7,
                marginBottom: "var(--space-5)",
              }}>
                {product.tagline}
              </p>

              <hr style={{ border: "none", borderTop: "1px solid var(--border-default)", margin: "0 0 var(--space-5)" }} />

              {/* Highlights */}
              {product.highlights.length > 0 && (
                <ul style={{
                  listStyle: "none", padding: 0, margin: "0 0 var(--space-5)",
                  display: "flex", flexDirection: "column", gap: "var(--space-2)",
                }}>
                  {product.highlights.map((h, i) => (
                    <li key={i} style={{
                      fontSize: "14px", color: "var(--text-secondary)",
                      paddingLeft: "var(--space-5)", position: "relative", lineHeight: 1.55,
                    }}>
                      <span style={{
                        position: "absolute", left: 0,
                        color: "var(--green-dark)", fontWeight: 700,
                      }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <hr style={{ border: "none", borderTop: "1px solid var(--border-default)", margin: "0 0 var(--space-5)" }} />

              {/* Mini specs table */}
              {product.specs.length > 0 && (
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  fontSize: "13px", marginBottom: "var(--space-5)",
                }}>
                  <tbody>
                    {product.specs.map((s, i) => (
                      <tr key={i}>
                        <td style={{
                          padding: "var(--space-2) var(--space-3)",
                          borderBottom: "1px solid var(--border-default)",
                          borderTop: i === 0 ? "1px solid var(--border-default)" : "none",
                          width: "42%", color: "var(--text-secondary)", verticalAlign: "top",
                        }}>
                          {s.label}
                        </td>
                        <td style={{
                          padding: "var(--space-2) var(--space-3)",
                          borderBottom: "1px solid var(--border-default)",
                          borderTop: i === 0 ? "1px solid var(--border-default)" : "none",
                          fontWeight: 500, color: "var(--text-primary)", verticalAlign: "top",
                        }}>
                          {s.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Usage note */}
              {product.usage_note && (
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--text-primary)" }}>How to use: </strong>
                  {product.usage_note}
                </div>
              )}
            </div>

            {/* ③ Buy box — right sticky column */}
            <BuyBox variants={variants} />

          </div>
        </div>
      </section>

      {/* BACK TO PRODUCTS */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-subtle)", textAlign: "center" }}>
        <div className="container">
          <Link href="/products" className="btn btn-outline">
            &larr; All Products
          </Link>
        </div>
      </section>
    </>
  );
}
