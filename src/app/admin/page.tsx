import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export const revalidate = 60;

async function getStats() {
  const supabase = createAdminClient();
  const [products, orders, users, pendingOrders] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    users: users.count ?? 0,
    pending: pendingOrders.count ?? 0,
  };
}

async function getRecentOrders() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("id, status, total, created_at, user:users(name, email)")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

const statusColor: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const statCards = [
    { label: "Products", value: stats.products, href: "/admin/products" },
    { label: "Total Orders", value: stats.orders, href: "/admin/orders" },
    { label: "Pending Orders", value: stats.pending, href: "/admin/orders", highlight: stats.pending > 0 },
    { label: "Users", value: stats.users, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "8px" }}>Dashboard</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "32px" }}>Welcome back. Here's what's happening.</p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "#fff",
              border: `1px solid ${s.highlight ? "#f59e0b" : "#e5e7eb"}`,
              borderRadius: "8px",
              padding: "20px 24px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: s.highlight ? "#f59e0b" : "#1a1a1a", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: "12px", color: "#6b7280" }}>View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ padding: "24px", fontSize: "13px", color: "#6b7280" }}>No orders yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Order ID", "Customer", "Total", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 24px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o: any) => (
                <tr key={o.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 24px" }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: "#2563eb", fontFamily: "monospace", fontSize: "12px" }}>
                      {o.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td style={{ padding: "12px 24px", color: "#374151" }}>{(o.user as any)?.name || (o.user as any)?.email || "—"}</td>
                  <td style={{ padding: "12px 24px", color: "#374151", fontWeight: 500 }}>₹{(o.total / 100).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 24px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: statusColor[o.status] ?? "#6b7280" }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 24px", color: "#6b7280" }}>
                    {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
