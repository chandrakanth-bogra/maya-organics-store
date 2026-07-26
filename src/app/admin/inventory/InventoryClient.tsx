"use client";

import { useState } from "react";

interface Variant { id: string; grain_size: string | null; pack_size: string; price: number; in_stock: boolean; }
interface Group { product: { id: string; name: string; slug: string }; variants: Variant[]; }

export default function InventoryClient({ groups: initialGroups }: { groups: Group[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");

  const toggleStock = async (variantId: string, current: boolean) => {
    await fetch(`/api/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_stock: !current }),
    });
    setGroups((gs) => gs.map((g) => ({
      ...g,
      variants: g.variants.map((v) => v.id === variantId ? { ...v, in_stock: !current } : v),
    })));
  };

  const startEditPrice = (v: Variant) => {
    setEditingPrice(v.id);
    setPriceInput(String(v.price / 100));
  };

  const savePrice = async (variantId: string) => {
    const price = Math.round(parseFloat(priceInput) * 100);
    if (!price || price <= 0) { setEditingPrice(null); return; }
    await fetch(`/api/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    setGroups((gs) => gs.map((g) => ({
      ...g,
      variants: g.variants.map((v) => v.id === variantId ? { ...v, price } : v),
    })));
    setEditingPrice(null);
  };

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Inventory</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Manage stock status and prices per variant</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {groups.map(({ product, variants }) => (
          <div key={product.id} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a" }}>{product.name}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  {["Grain Size", "Pack Size", "Price", "Stock"].map((h) => (
                    <th key={h} style={{ padding: "8px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 20px", color: "#374151" }}>{v.grain_size ?? "—"}</td>
                    <td style={{ padding: "10px 20px", color: "#374151" }}>{v.pack_size}</td>
                    <td style={{ padding: "10px 20px" }}>
                      {editingPrice === v.id ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>₹</span>
                          <input
                            autoFocus
                            type="number"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            onBlur={() => savePrice(v.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") savePrice(v.id); if (e.key === "Escape") setEditingPrice(null); }}
                            style={{ width: "80px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px" }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditPrice(v)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#1a1a1a", padding: 0, textDecoration: "underline dotted" }}
                        >
                          ₹{(v.price / 100).toLocaleString("en-IN")}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 20px" }}>
                      <button
                        onClick={() => toggleStock(v.id, v.in_stock)}
                        style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: v.in_stock ? "#d1fae5" : "#fee2e2", color: v.in_stock ? "#065f46" : "#991b1b" }}
                      >
                        {v.in_stock ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
