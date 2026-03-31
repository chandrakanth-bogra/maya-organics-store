import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export const revalidate = 0;

const statusColor: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  shipped:   { bg: "#ede9fe", text: "#5b21b6" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, coupon_code, user:users(name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Orders</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>{orders?.length ?? 0} total orders</p>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {(!orders || orders.length === 0) ? (
          <p style={{ padding: "32px", fontSize: "13px", color: "#6b7280" }}>No orders yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Order ID", "Customer", "Total", "Coupon", "Status", "Date", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => {
                const sc = statusColor[o.status] ?? { bg: "#f3f4f6", text: "#374151" };
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: "11px", color: "#6b7280" }}>{o.id.slice(0, 8)}…</td>
                    <td style={{ padding: "12px 20px", color: "#374151" }}>{o.user?.name || o.user?.email || "—"}</td>
                    <td style={{ padding: "12px 20px", fontWeight: 600, color: "#1a1a1a" }}>₹{(o.total / 100).toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 20px", color: "#6b7280" }}>{o.coupon_code ?? "—"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: sc.bg, color: sc.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px", color: "#6b7280" }}>
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "right" }}>
                      <Link href={`/admin/orders/${o.id}`} style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
