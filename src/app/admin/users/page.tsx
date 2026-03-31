import { createAdminClient } from "@/lib/supabase-admin";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>Users</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>{users?.length ?? 0} registered users</p>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        {(!users || users.length === 0) ? (
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
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
