import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const statusColor: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  shipped:   { bg: "#ede9fe", text: "#5b21b6" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;

  const db = getDb();
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.userId, session.user.id)),
    with: {
      items: {
        with: {
          variant: {
            columns: { grainSize: true, packSize: true },
            with: {
              product: { columns: { name: true, slug: true, imageThumb: true } },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const sc = statusColor[order.status] ?? { bg: "#f3f4f6", text: "#374151" };
  const addr = order.shippingAddress;

  return (
    <>
      {/* Header */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="container">
          <Link href="/account" style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}>
            ← My Account
          </Link>

          {success === "true" && (
            <div style={{ margin: "var(--space-5) 0 var(--space-4)", padding: "var(--space-4) var(--space-5)", backgroundColor: "rgba(0,100,0,0.06)", border: "1px solid var(--green-dark)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--green-dark)", marginBottom: "4px" }}>
                Order confirmed!
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Thank you for your order. We&apos;ll start processing it right away.
              </p>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(20px, 3vw, 32px)", color: "var(--text-primary)", margin: 0 }}>
              Order
            </h1>
            <span style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--text-secondary)" }}>{order.id}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "var(--radius-sm)", backgroundColor: sc.bg, color: sc.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {order.status}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "var(--space-2) 0 0" }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container" style={{ maxWidth: "720px", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

          {/* Items */}
          <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)" }}>
            <h3 style={{ marginBottom: "var(--space-5)", fontSize: "15px", color: "var(--text-primary)" }}>Items Ordered</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {order.items.map((item) => {
                const v = item.variant;
                const p = v?.product;
                const variantLabel = [v?.grainSize, v?.packSize].filter(Boolean).join(" · ");
                return (
                  <div key={item.id} style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--bg-page)" }}>
                      {p?.imageThumb && (
                        <img src={`/images/${p.imageThumb}`} alt={p?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{p?.name ?? "—"}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{variantLabel} × {item.quantity}</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", flexShrink: 0 }}>
                      ₹{((item.priceAtPurchase * item.quantity) / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)" }}>
            <h3 style={{ marginBottom: "var(--space-5)", fontSize: "15px", color: "var(--text-primary)" }}>Payment Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span>₹{(order.subtotal / 100).toLocaleString("en-IN")}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Discount {order.couponCode ? `(${order.couponCode})` : ""}
                  </span>
                  <span style={{ color: "var(--green-dark)", fontWeight: 600 }}>
                    −₹{(order.discount / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                <span style={{ color: "var(--text-secondary)" }}>Free</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "16px" }}>
                <span>Total Paid</span>
                <span style={{ color: "var(--green-dark)" }}>₹{(order.total / 100).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)" }}>
            <h3 style={{ marginBottom: "var(--space-4)", fontSize: "15px", color: "var(--text-primary)" }}>Shipping Address</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
              {addr.city}, {addr.state} — {addr.pincode}
            </p>
          </div>

          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <Link href="/account" className="btn btn-outline" style={{ fontSize: "13px" }}>← My Account</Link>
            <Link href="/products" className="btn btn-primary" style={{ fontSize: "13px" }}>Continue Shopping</Link>
          </div>

        </div>
      </section>
    </>
  );
}
