import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const db = getDb();

  const users = await db
    .select({ id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt })
    .from(user)
    .orderBy(desc(user.createdAt));

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Users</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>{users.length} registered users</p>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {users.length === 0 ? (
          <p style={{ padding: "32px", fontSize: "13px", color: "#6b7280" }}>No users yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Name", "Email", "Phone", "Joined"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 500, color: "#1a1a1a" }}>{u.name ?? "—"}</td>
                  <td style={{ padding: "12px 20px", color: "#374151" }}>{u.email}</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>{u.phone ?? "—"}</td>
                  <td style={{ padding: "12px 20px", color: "#6b7280" }}>
                    {u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
