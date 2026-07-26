import Link from "next/link";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminPage();
  const db = getDb();

  const productList = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      category: products.category,
      price: products.price,
      priceUnit: products.priceUnit,
      imageThumb: products.imageThumb,
      inStock: products.inStock,
    })
    .from(products)
    .orderBy(asc(products.name));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Products</h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>{productList.length} products</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Product", "Category", "From price", "Stock", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productList.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                      {p.imageThumb && (
                        <Image src={`/images/${p.imageThumb}`} alt={p.name} width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{p.name}</div>
                      <div style={{ color: "#9ca3af", fontSize: "11px" }}>{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 20px", color: "#6b7280" }}>{p.category}</td>
                <td style={{ padding: "12px 20px", color: "#374151", fontWeight: 500 }}>
                  ₹{(p.price / 100).toLocaleString("en-IN")} <span style={{ color: "#9ca3af", fontWeight: 400 }}>/ {p.priceUnit}</span>
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: p.inStock ? "#10b981" : "#ef4444" }}>
                    {p.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td style={{ padding: "12px 20px", textAlign: "right" }}>
                  <Link href={`/admin/products/${p.id}`} style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
