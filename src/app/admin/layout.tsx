"use client";

import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/products", label: "Products", icon: "⊞" },
  { href: "/admin/orders", label: "Orders", icon: "◷" },
  { href: "/admin/users", label: "Users", icon: "◯" },
  { href: "/admin/inventory", label: "Inventory", icon: "◻" },
  { href: "/admin/coupons", label: "Coupons", icon: "◈" },
  { href: "/admin/discounts", label: "Vol. Discounts", icon: "◑" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f5f7" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px",
        flexShrink: 0,
        backgroundColor: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 100,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
              Maya Organics
            </div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
              Admin Panel
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
              }}
            >
              <span style={{ fontSize: "14px", opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back to site */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}
