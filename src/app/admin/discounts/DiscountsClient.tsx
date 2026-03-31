"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface VolumeDiscount { id: string; min_order_amount: number; discount_percent: number; label: string | null; }

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", backgroundColor: "#fff", fontFamily: "inherit", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" };

export default function DiscountsClient({ initialDiscounts }: { initialDiscounts: VolumeDiscount[] }) {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [form, setForm] = useState({ min_order_amount: "", discount_percent: "", label: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const { data } = await supabase.from("volume_discounts").select("*").order("min_order_amount");
    setDiscounts(data ?? []);
  };

  const startEdit = (d: VolumeDiscount) => {
    setEditingId(d.id);
    setForm({ min_order_amount: String(d.min_order_amount / 100), discount_percent: String(d.discount_percent), label: d.label ?? "" });
    setMsg("");
  };

  const cancel = () => { setEditingId(null); setForm({ min_order_amount: "", discount_percent: "", label: "" }); setMsg(""); };

  const save = async () => {
    if (!form.min_order_amount || !form.discount_percent) { setMsg("Min order and discount percent are required."); return; }
    const payload = { min_order_amount: Math.round(parseFloat(form.min_order_amount) * 100), discount_percent: parseInt(form.discount_percent), label: form.label || null };
    const { error } = editingId && editingId !== "new"
      ? await supabase.from("volume_discounts").update(payload).eq("id", editingId)
      : await supabase.from("volume_discounts").insert(payload);
    if (error) { setMsg(error.message); return; }
    cancel();
    refresh();
  };

  const del = async (id: string) => {
    await supabase.from("volume_discounts").delete().eq("id", id);
    setDiscounts((ds) => ds.filter((d) => d.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Volume Discounts</h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>Auto-applied discount tiers based on order total</p>
        </div>
        {!editingId && <button onClick={() => setEditingId("new")} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>+ Add Tier</button>}
      </div>

      {editingId && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>{editingId === "new" ? "New Tier" : "Edit Tier"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Min Order ₹ *</label>
              <input style={inputStyle} type="number" value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))} placeholder="2000" />
            </div>
            <div>
              <label style={labelStyle}>Discount % *</label>
              <input style={inputStyle} type="number" value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} placeholder="10" />
            </div>
            <div>
              <label style={labelStyle}>Label</label>
              <input style={inputStyle} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. 10% off on ₹2000+" />
            </div>
          </div>
          {msg && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>{msg}</p>}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button onClick={save} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={cancel} style={{ backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {discounts.length === 0 ? (
          <p style={{ padding: "32px", fontSize: "13px", color: "#6b7280" }}>No discount tiers yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Min Order", "Discount", "Label", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 600, color: "#1a1a1a" }}>₹{(d.min_order_amount / 100).toLocaleString("en-IN")}+</td>
                  <td style={{ padding: "12px 20px", color: "#10b981", fontWeight: 700 }}>{d.discount_percent}% off</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>{d.label ?? "—"}</td>
                  <td style={{ padding: "12px 20px", display: "flex", gap: "12px" }}>
                    <button onClick={() => startEdit(d)} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => del(d.id)} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
