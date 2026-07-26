"use client";

import { useState } from "react";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
}

const EMPTY: Omit<Coupon, "id" | "used_count"> = {
  code: "", discount_type: "percent", value: 0,
  min_order_amount: 0, usage_limit: null, expires_at: null, active: true,
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#374151", backgroundColor: "#fff", fontFamily: "inherit", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" };

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/admin/coupons");
    const { coupons: data } = await res.json();
    setCoupons(data ?? []);
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({ code: c.code, discount_type: c.discount_type, value: c.value, min_order_amount: c.min_order_amount / 100, usage_limit: c.usage_limit, expires_at: c.expires_at ? c.expires_at.slice(0, 10) : null, active: c.active });
    setMsg("");
  };

  const cancel = () => { setEditingId(null); setForm(EMPTY); setMsg(""); };

  const save = async () => {
    if (!form.code) { setMsg("Code is required."); return; }
    const payload = { ...form, code: form.code.toUpperCase(), min_order_amount: Math.round((form.min_order_amount as number) * 100), expires_at: form.expires_at || null };
    const res = editingId === "new"
      ? await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/admin/coupons/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { setMsg("Failed to save coupon."); return; }
    cancel();
    refresh();
  };

  const deleteCoupon = async (id: string) => {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((cs) => cs.filter((c) => c.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !current }) });
    setCoupons((cs) => cs.map((c) => c.id === id ? { ...c, active: !current } : c));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Coupons</h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>{coupons.length} coupon codes</p>
        </div>
        {!editingId && <button onClick={() => { setEditingId("new"); setForm(EMPTY); }} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>+ New Coupon</button>}
      </div>

      {/* Form */}
      {editingId && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "16px" }}>{editingId === "new" ? "New Coupon" : "Edit Coupon"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input style={inputStyle} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE10" />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as "percent" | "flat" }))}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Value *</label>
              <input style={inputStyle} type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))} placeholder={form.discount_type === "percent" ? "10" : "50"} />
            </div>
            <div>
              <label style={labelStyle}>Min Order ₹</label>
              <input style={inputStyle} type="number" value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: parseFloat(e.target.value) || 0 }))} placeholder="500" />
            </div>
            <div>
              <label style={labelStyle}>Usage Limit</label>
              <input style={inputStyle} type="number" value={form.usage_limit ?? ""} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value ? parseInt(e.target.value) : null }))} placeholder="Unlimited" />
            </div>
            <div>
              <label style={labelStyle}>Expires</label>
              <input style={inputStyle} type="date" value={form.expires_at ?? ""} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value || null }))} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151", cursor: "pointer", marginTop: "12px" }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            Active
          </label>
          {msg && <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>{msg}</p>}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button onClick={save} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={cancel} style={{ backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {coupons.length === 0 ? (
          <p style={{ padding: "32px", fontSize: "13px", color: "#6b7280" }}>No coupons yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Code", "Discount", "Min Order", "Usage", "Expires", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 700, color: "#1a1a1a", fontFamily: "monospace" }}>{c.code}</td>
                  <td style={{ padding: "12px 20px", color: "#374151" }}>{c.discount_type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>{c.min_order_amount ? `₹${(c.min_order_amount / 100).toLocaleString("en-IN")}` : "—"}</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <button onClick={() => toggleActive(c.id, c.active)} style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: c.active ? "#d1fae5" : "#f3f4f6", color: c.active ? "#065f46" : "#6b7280" }}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 20px", display: "flex", gap: "12px" }}>
                    <button onClick={() => startEdit(c)} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={() => deleteCoupon(c.id)} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
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
