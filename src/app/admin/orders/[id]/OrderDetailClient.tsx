"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];

const statusColor: Record<Status, { bg: string; text: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  shipped:   { bg: "#ede9fe", text: "#5b21b6" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(order.status);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const updateStatus = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMsg(res.ok ? "Status updated." : "Failed to update status.");
    setSaving(false);
  };

  const addr = order.shippingAddress ?? {};
  const sc = statusColor[status as Status] ?? { bg: "#f3f4f6", text: "#374151" };

  const card: React.CSSProperties = { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px 24px", marginBottom: "20px" };
  const label: React.CSSProperties = { fontSize: "11px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px", display: "block" };

  return (
    <div style={{ maxWidth: "720px" }}>
      <button onClick={() => router.push("/admin/orders")} style={{ fontSize: "12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "12px" }}>
        ← Orders
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>Order</h1>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b7280" }}>{order.id}</span>
        </div>
        <span style={{ fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "4px", backgroundColor: sc.bg, color: sc.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {status}
        </span>
      </div>

      {/* Update status */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "12px" }}>Update Status</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", border: "none",
                backgroundColor: status === s ? statusColor[s].bg : "#f3f4f6",
                color: status === s ? statusColor[s].text : "#6b7280",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={updateStatus} disabled={saving || status === order.status} style={{ backgroundColor: "#1a1a1a", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: status === order.status ? 0.5 : 1 }}>
            {saving ? "Saving…" : "Update Status"}
          </button>
          {msg && <span style={{ fontSize: "12px", color: msg.includes("updated") ? "#10b981" : "#ef4444" }}>{msg}</span>}
        </div>
      </div>

      {/* Customer */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "12px" }}>Customer</div>
        <div style={{ fontSize: "14px", color: "#374151" }}>
          <div style={{ fontWeight: 600 }}>{order.user?.name ?? "—"}</div>
          <div>{order.user?.email}</div>
          {order.user?.phone && <div>{order.user.phone}</div>}
        </div>
      </div>

      {/* Shipping address */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "12px" }}>Shipping Address</div>
        <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
          {addr.city}, {addr.state} — {addr.pincode}
        </div>
      </div>

      {/* Items */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "12px" }}>Order Items</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
              {["Product", "Variant", "Qty", "Price"].map((h) => (
                <th key={h} style={{ padding: "6px 0", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item: any) => {
              const v = item.variant;
              const variantLabel = [v?.grainSize, v?.packSize].filter(Boolean).join(" · ");
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "10px 0", fontWeight: 500, color: "#1a1a1a" }}>{v?.product?.name ?? "—"}</td>
                  <td style={{ padding: "10px 0", color: "#6b7280" }}>{variantLabel}</td>
                  <td style={{ padding: "10px 0", color: "#374151" }}>{item.quantity}</td>
                  <td style={{ padding: "10px 0", fontWeight: 500, color: "#1a1a1a" }}>₹{(item.priceAtPurchase * item.quantity / 100).toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Subtotal</span>
            <span>₹{(order.subtotal / 100).toLocaleString("en-IN")}</span>
          </div>
          {order.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span style={{ color: "#10b981" }}>−₹{(order.discount / 100).toLocaleString("en-IN")}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "15px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
            <span>Total</span>
            <span>₹{(order.total / 100).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
