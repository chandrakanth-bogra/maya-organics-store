"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CartClient() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartCount, cartTotal, removeItem, updateQty, loading } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) return null;

  return (
    <>
      {/* HEADER */}
      <section
        className="section-sm"
        style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-default)" }}
      >
        <div className="container">
          <span className="eyebrow">Your cart</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "var(--green-dark)", marginBottom: 0 }}>
            {cartCount === 0 ? "Your cart is empty" : `${cartCount} item${cartCount !== 1 ? "s" : ""}`}
          </h1>
        </div>
      </section>

      {/* MAIN */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          {cartItems.length === 0 && !loading ? (
            <div style={{ textAlign: "center", padding: "var(--space-9) 0" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border-default)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "var(--space-5)" }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h3 style={{ marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>Nothing here yet</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
                Add some products to get started.
              </p>
              <Link href="/products" className="btn btn-primary">Shop Products</Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* LEFT: Cart items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {cartItems.map((item) => {
                  const variantLabel = [item.variant.grain_size, item.variant.pack_size].filter(Boolean).join(" · ");
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: "var(--space-4)",
                        padding: "var(--space-5)",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{ flexShrink: 0, width: "76px", height: "76px", borderRadius: "var(--radius-sm)", overflow: "hidden", backgroundColor: "var(--bg-page)" }}>
                        <Image
                          src={`/images/${item.variant.product.image_thumb}`}
                          alt={item.variant.product.name}
                          width={76}
                          height={76}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          style={{ fontSize: "15px", fontWeight: 500, color: "var(--green-dark)", display: "block" }}
                        >
                          {item.variant.product.name}
                        </Link>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {variantLabel}
                        </div>

                        {/* Qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginTop: "var(--space-3)" }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "18px", lineHeight: 1 }}
                            >
                              −
                            </button>
                            <span style={{ width: "32px", textAlign: "center", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: "18px", lineHeight: 1 }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-body)" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Line price */}
                      <div style={{ flexShrink: 0, fontSize: "15px", fontWeight: 500, color: "var(--text-primary)", paddingTop: "2px" }}>
                        ₹{((item.variant.price * item.quantity) / 100).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Order summary */}
              <div style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                height: "fit-content",
                position: "sticky",
                top: "calc(var(--navbar-height) + var(--space-5))",
              }}>
                <h3 style={{ marginBottom: "var(--space-6)" }}>Order Summary</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>₹{(cartTotal / 100).toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                    <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Calculated at checkout</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>Estimated Total</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--green-dark)" }}>
                      ₹{(cartTotal / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn btn-primary"
                  style={{ display: "block", textAlign: "center", marginTop: "var(--space-6)", padding: "16px", fontSize: "14px" }}
                >
                  Proceed to Checkout →
                </Link>
                <Link
                  href="/products"
                  className="btn-text"
                  style={{ display: "block", textAlign: "center", marginTop: "var(--space-4)", fontSize: "13px", color: "var(--text-secondary)" }}
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
