"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  metaDescription: string | null;
  price: number;
  priceUnit: string;
  imageMain: string | null;
  imageThumb: string | null;
  usageNote: string | null;
  textureClass: string;
  hasSizeGuide: boolean;
  inStock: boolean;
  highlights: string[];
  specs: { label: string; value: string }[];
}

interface Variant {
  id: string;
  grainSize: string | null;
  packSize: string;
  price: number;
  inStock: boolean;
  sortOrder: number;
}

const EMPTY_VARIANT = { grain_size: "", pack_size: "", price: 0, in_stock: true, sort_order: 0 };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  color: "#374151",
  backgroundColor: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "4px",
};

export default function ProductEditClient({ product, variants: initialVariants }: { product: Product; variants: Variant[] }) {
  const router = useRouter();

  /* Product form state */
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    tagline: product.tagline ?? "",
    meta_description: product.metaDescription ?? "",
    price: product.price,
    price_unit: product.priceUnit,
    image_main: product.imageMain ?? "",
    image_thumb: product.imageThumb ?? "",
    usage_note: product.usageNote ?? "",
    texture_class: product.textureClass ?? "",
    has_size_guide: product.hasSizeGuide,
    in_stock: product.inStock,
  });
  const [highlights, setHighlights] = useState<string[]>(product.highlights ?? [""]);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    product.specs?.length ? product.specs : [{ label: "", value: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  /* Variant state */
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantMsg, setVariantMsg] = useState("");

  /* Save product */
  const saveProduct = async () => {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        highlights: highlights.filter(Boolean),
        specs: specs.filter((s) => s.label),
      }),
    });
    setMsg(res.ok ? "Saved." : "Failed to save.");
    if (res.ok) router.refresh();
    setSaving(false);
  };

  /* Variant helpers */
  const startEditVariant = (v: Variant) => {
    setEditingVariant(v.id);
    setVariantForm({
      grain_size: v.grainSize ?? "",
      pack_size: v.packSize,
      price: v.price / 100,
      in_stock: v.inStock,
      sort_order: v.sortOrder,
    });
    setVariantMsg("");
  };

  const cancelVariant = () => {
    setEditingVariant(null);
    setVariantForm(EMPTY_VARIANT);
    setVariantMsg("");
  };

  const saveVariant = async () => {
    if (!variantForm.pack_size || variantForm.price <= 0) {
      setVariantMsg("Pack size and price are required.");
      return;
    }
    const payload = {
      grain_size: variantForm.grain_size || null,
      pack_size: variantForm.pack_size,
      price: Math.round(variantForm.price * 100),
      in_stock: variantForm.in_stock,
      sort_order: variantForm.sort_order,
    };
    let res;
    if (editingVariant) {
      res = await fetch(`/api/admin/variants/${editingVariant}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (!res.ok) { setVariantMsg("Failed to save variant."); return; }
    setVariantMsg("");
    cancelVariant();
    // Refresh variants
    const listRes = await fetch(`/api/admin/products/${product.id}/variants`);
    const { variants: data } = await listRes.json();
    setVariants(data ?? []);
  };

  const deleteVariant = async (id: string) => {
    await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
    setVariants((vs) => vs.filter((v) => v.id !== id));
  };

  const toggleVariantStock = async (id: string, current: boolean) => {
    await fetch(`/api/admin/variants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_stock: !current }),
    });
    setVariants((vs) => vs.map((v) => v.id === id ? { ...v, inStock: !current } : v));
  };

  const card: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <button onClick={() => router.push("/admin/products")} style={{ fontSize: "12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "6px" }}>
            ← Products
          </button>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{product.name}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {msg && <span style={{ fontSize: "12px", color: msg === "Saved." ? "#10b981" : "#ef4444" }}>{msg}</span>}
          <button onClick={saveProduct} disabled={saving} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div style={card}>
        <div style={sectionTitle}>Basic Info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "price_unit", label: "Display Price Unit" },
            { key: "texture_class", label: "Texture Class" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Display "From" Price (₹)</label>
            <input style={inputStyle} type="number" value={form.price / 100} onChange={(e) => setForm((f) => ({ ...f, price: Math.round(parseFloat(e.target.value) * 100) }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))} />
              In Stock
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={form.has_size_guide} onChange={(e) => setForm((f) => ({ ...f, has_size_guide: e.target.checked }))} />
              Has Size Guide
            </label>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>Tagline</label>
          <textarea style={{ ...inputStyle, height: "60px", resize: "vertical" }} value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
        </div>
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>Meta Description</label>
          <textarea style={{ ...inputStyle, height: "60px", resize: "vertical" }} value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} />
        </div>
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>Usage Note</label>
          <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }} value={form.usage_note} onChange={(e) => setForm((f) => ({ ...f, usage_note: e.target.value }))} />
        </div>
      </div>

      {/* Images */}
      <div style={card}>
        <div style={sectionTitle}>Images</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Main Image filename</label>
            <input style={inputStyle} value={form.image_main} onChange={(e) => setForm((f) => ({ ...f, image_main: e.target.value }))} placeholder="perlite-jar.jpg" />
          </div>
          <div>
            <label style={labelStyle}>Thumb Image filename</label>
            <input style={inputStyle} value={form.image_thumb} onChange={(e) => setForm((f) => ({ ...f, image_thumb: e.target.value }))} placeholder="perlite-plain.jpg" />
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div style={card}>
        <div style={sectionTitle}>Highlights</div>
        {highlights.map((h, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input style={{ ...inputStyle, flex: 1 }} value={h} onChange={(e) => setHighlights((hs) => hs.map((x, j) => j === i ? e.target.value : x))} placeholder={`Highlight ${i + 1}`} />
            <button onClick={() => setHighlights((hs) => hs.filter((_, j) => j !== i))} style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", color: "#ef4444", fontSize: "14px" }}>✕</button>
          </div>
        ))}
        <button onClick={() => setHighlights((hs) => [...hs, ""])} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "4px" }}>
          + Add highlight
        </button>
      </div>

      {/* Specs */}
      <div style={card}>
        <div style={sectionTitle}>Specifications</div>
        {specs.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "8px", marginBottom: "8px" }}>
            <input style={inputStyle} value={s.label} onChange={(e) => setSpecs((ss) => ss.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Label" />
            <input style={inputStyle} value={s.value} onChange={(e) => setSpecs((ss) => ss.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="Value" />
            <button onClick={() => setSpecs((ss) => ss.filter((_, j) => j !== i))} style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fff", cursor: "pointer", color: "#ef4444", fontSize: "14px" }}>✕</button>
          </div>
        ))}
        <button onClick={() => setSpecs((ss) => [...ss, { label: "", value: "" }])} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: "4px" }}>
          + Add spec
        </button>
      </div>

      {/* Variants */}
      <div style={card}>
        <div style={sectionTitle}>Variants (SKUs)</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "16px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Grain Size", "Pack Size", "Price", "Stock", ""].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px", color: "#374151" }}>{v.grainSize ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#374151" }}>{v.packSize}</td>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#1a1a1a" }}>₹{(v.price / 100).toLocaleString("en-IN")}</td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => toggleVariantStock(v.id, v.inStock)} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: v.inStock ? "#d1fae5" : "#fee2e2", color: v.inStock ? "#065f46" : "#991b1b" }}>
                    {v.inStock ? "In Stock" : "Out of Stock"}
                  </button>
                </td>
                <td style={{ padding: "10px 12px", display: "flex", gap: "12px" }}>
                  <button onClick={() => startEditVariant(v)} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deleteVariant(v.id)} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Variant form */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>
            {editingVariant ? "Edit Variant" : "Add Variant"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px auto", gap: "10px", alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Grain Size</label>
              <input style={inputStyle} value={variantForm.grain_size} onChange={(e) => setVariantForm((f) => ({ ...f, grain_size: e.target.value }))} placeholder="e.g. 3–8mm (or leave blank)" />
            </div>
            <div>
              <label style={labelStyle}>Pack Size *</label>
              <input style={inputStyle} value={variantForm.pack_size} onChange={(e) => setVariantForm((f) => ({ ...f, pack_size: e.target.value }))} placeholder="e.g. 225g pouch" />
            </div>
            <div>
              <label style={labelStyle}>Price ₹ *</label>
              <input style={inputStyle} type="number" value={variantForm.price} onChange={(e) => setVariantForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))} placeholder="99" />
            </div>
            <div>
              <label style={labelStyle}>Sort</label>
              <input style={inputStyle} type="number" value={variantForm.sort_order} onChange={(e) => setVariantForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={saveVariant} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {editingVariant ? "Update" : "Add"}
              </button>
              {editingVariant && (
                <button onClick={cancelVariant} style={{ backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", cursor: "pointer" }}>✕</button>
              )}
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#374151", cursor: "pointer", marginTop: "10px" }}>
            <input type="checkbox" checked={variantForm.in_stock} onChange={(e) => setVariantForm((f) => ({ ...f, in_stock: e.target.checked }))} />
            In Stock
          </label>
          {variantMsg && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>{variantMsg}</p>}
        </div>
      </div>
    </div>
  );
}
