"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface VolumeTier { min_order_amount: number; discount_percent: number; label: string | null; }

const EMPTY_FORM = { label: "Home", line1: "", line2: "", city: "", state: "", pincode: "" };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-page)",
  color: "var(--text-primary)", fontSize: "14px", fontFamily: "var(--font-body)",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)",
  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px",
};

export default function CheckoutClient({ savedAddresses, volumeTiers }: {
  savedAddresses: Address[];
  volumeTiers: VolumeTier[];
}) {
  const router = useRouter();
  const { cartItems, cartTotal, loading: cartLoading } = useCart();

  // Address selection
  const defaultId = savedAddresses.find((a) => a.is_default)?.id ?? savedAddresses[0]?.id ?? "new";
  const [selectedId, setSelectedId] = useState<string>(defaultId);
  const [newAddr, setNewAddr] = useState(EMPTY_FORM);
  const [showNewForm, setShowNewForm] = useState(savedAddresses.length === 0);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<{ discount: number; code: string; label: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);

  // Place order
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // Computed totals
  const subtotal = cartTotal;
  const couponDiscount = couponResult?.discount ?? 0;
  const autoDiscount = couponResult
    ? 0
    : (volumeTiers.filter((t) => subtotal >= t.min_order_amount).pop()?.discount_percent ?? 0);
  const autoDiscountAmt = Math.round(subtotal * autoDiscount / 100);
  const discount = couponResult ? couponDiscount : autoDiscountAmt;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError("");
    setCouponResult(null);
    const res = await fetch(`/api/coupon?code=${encodeURIComponent(couponInput)}&subtotal=${subtotal}`);
    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error);
    } else {
      setCouponResult(data);
    }
    setCouponChecking(false);
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponInput("");
    setCouponError("");
  };

  const getShippingAddress = () => {
    if (selectedId === "new" || showNewForm) return newAddr;
    const saved = savedAddresses.find((a) => a.id === selectedId);
    if (!saved) return newAddr;
    return { label: saved.label, line1: saved.line1, line2: saved.line2, city: saved.city, state: saved.state, pincode: saved.pincode };
  };

  const placeOrder = async () => {
    const address = getShippingAddress();
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      setPlaceError("Please fill in your shipping address.");
      return;
    }
    setPlacing(true);
    setPlaceError("");
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, coupon_code: couponResult?.code ?? null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPlaceError(data.error ?? "Something went wrong. Please try again.");
      setPlacing(false);
      return;
    }
    router.push(`/account/orders/${data.order_id}?success=true`);
  };

  if (cartLoading) return null;

  if (!cartLoading && cartItems.length === 0) {
    return (
      <section className="section" style={{ backgroundColor: "var(--bg-surface)", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "480px" }}>
          <h2 style={{ marginBottom: "var(--space-4)" }}>Your cart is empty</h2>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="container">
          <span className="eyebrow">Checkout</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--green-dark)", marginBottom: 0 }}>Complete Your Order</h1>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          <div className="cart-layout">

            {/* LEFT: Address + Coupon */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

              {/* Address section */}
              <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)" }}>
                <h3 style={{ marginBottom: "var(--space-5)", color: "var(--text-primary)", fontSize: "16px" }}>Delivery Address</h3>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
                    {savedAddresses.map((a) => (
                      <label key={a.id} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", cursor: "pointer", padding: "var(--space-4)", backgroundColor: selectedId === a.id && !showNewForm ? "var(--bg-page)" : "transparent", border: `1px solid ${selectedId === a.id && !showNewForm ? "var(--green-dark)" : "var(--border-default)"}`, borderRadius: "var(--radius-sm)", transition: "var(--ease)" }}>
                        <input
                          type="radio"
                          name="address"
                          value={a.id}
                          checked={selectedId === a.id && !showNewForm}
                          onChange={() => { setSelectedId(a.id); setShowNewForm(false); }}
                          style={{ marginTop: "2px", accentColor: "var(--green-dark)" }}
                        />
                        <div>
                          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "2px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</span>
                            {a.is_default && <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--green-dark)", backgroundColor: "rgba(0,100,0,0.08)", padding: "1px 6px", borderRadius: "3px" }}>Default</span>}
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                            {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} — {a.pincode}
                          </p>
                        </div>
                      </label>
                    ))}

                    {/* Use new address toggle */}
                    <label style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", cursor: "pointer", padding: "var(--space-3) var(--space-4)", border: `1px solid ${showNewForm ? "var(--green-dark)" : "var(--border-default)"}`, borderRadius: "var(--radius-sm)", backgroundColor: showNewForm ? "var(--bg-page)" : "transparent" }}>
                      <input
                        type="radio"
                        name="address"
                        checked={showNewForm}
                        onChange={() => setShowNewForm(true)}
                        style={{ accentColor: "var(--green-dark)" }}
                      />
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>+ Use a different address</span>
                    </label>
                  </div>
                )}

                {/* New address form */}
                {(showNewForm || savedAddresses.length === 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Label</label>
                      <input style={inputStyle} value={newAddr.label} onChange={(e) => setNewAddr((f) => ({ ...f, label: e.target.value }))} placeholder="Home / Office" />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Address Line 1 *</label>
                      <input style={inputStyle} value={newAddr.line1} onChange={(e) => setNewAddr((f) => ({ ...f, line1: e.target.value }))} placeholder="House / Flat / Building" />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Address Line 2</label>
                      <input style={inputStyle} value={newAddr.line2} onChange={(e) => setNewAddr((f) => ({ ...f, line2: e.target.value }))} placeholder="Street / Area (optional)" />
                    </div>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input style={inputStyle} value={newAddr.city} onChange={(e) => setNewAddr((f) => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input style={inputStyle} value={newAddr.state} onChange={(e) => setNewAddr((f) => ({ ...f, state: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Pincode *</label>
                      <input style={inputStyle} value={newAddr.pincode} onChange={(e) => setNewAddr((f) => ({ ...f, pincode: e.target.value }))} maxLength={6} placeholder="500001" />
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon section */}
              <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)" }}>
                <h3 style={{ marginBottom: "var(--space-4)", color: "var(--text-primary)", fontSize: "16px" }}>Promo Code</h3>

                {couponResult ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3) var(--space-4)", backgroundColor: "rgba(0,100,0,0.06)", border: "1px solid var(--green-dark)", borderRadius: "var(--radius-sm)" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--green-dark)" }}>{couponResult.code}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "8px" }}>{couponResult.label} applied</span>
                    </div>
                    <button onClick={removeCoupon} style={{ fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <input
                      style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                      placeholder="Enter code"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponChecking || !couponInput.trim()}
                      className="btn btn-outline"
                      style={{ fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      {couponChecking ? "Checking…" : "Apply"}
                    </button>
                  </div>
                )}
                {couponError && <p style={{ fontSize: "12px", color: "var(--accent-red, #ef4444)", marginTop: "var(--space-2)" }}>{couponError}</p>}

                {/* Volume discount hint */}
                {!couponResult && volumeTiers.length > 0 && (() => {
                  const next = volumeTiers.find((t) => subtotal < t.min_order_amount);
                  const applied = volumeTiers.filter((t) => subtotal >= t.min_order_amount).pop();
                  if (applied) return (
                    <p style={{ fontSize: "12px", color: "var(--green-dark)", marginTop: "var(--space-3)" }}>
                      {applied.label ?? `${applied.discount_percent}% volume discount applied`}
                    </p>
                  );
                  if (next) return (
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "var(--space-3)" }}>
                      Add ₹{((next.min_order_amount - subtotal) / 100).toLocaleString("en-IN")} more to get {next.discount_percent}% off
                    </p>
                  );
                  return null;
                })()}
              </div>
            </div>

            {/* RIGHT: Order summary */}
            <div style={{ position: "sticky", top: "calc(var(--navbar-height) + var(--space-5))", backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", height: "fit-content" }}>
              <h3 style={{ marginBottom: "var(--space-5)" }}>Order Summary</h3>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)", paddingBottom: "var(--space-5)", borderBottom: "1px solid var(--border-default)" }}>
                {cartItems.map((item) => {
                  const variantLabel = [item.variant.grain_size, item.variant.pack_size].filter(Boolean).join(" · ");
                  return (
                    <div key={item.id} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--bg-page)" }}>
                        <Image src={`/images/${item.variant.product.image_thumb}`} alt={item.variant.product.name} width={48} height={48} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.variant.product.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{variantLabel} × {item.quantity}</div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", flexShrink: 0 }}>
                        ₹{((item.variant.price * item.quantity) / 100).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                  <span>₹{(subtotal / 100).toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {couponResult ? `Coupon (${couponResult.code})` : `Volume discount (${autoDiscount}%)`}
                    </span>
                    <span style={{ color: "var(--green-dark)", fontWeight: 600 }}>−₹{(discount / 100).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                  <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Free</span>
                </div>
                <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "15px" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--green-dark)" }}>
                    ₹{(total / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {placeError && (
                <p style={{ fontSize: "13px", color: "var(--accent-red, #ef4444)", marginBottom: "var(--space-4)" }}>{placeError}</p>
              )}

              <button
                onClick={placeOrder}
                disabled={placing}
                className="btn btn-primary"
                style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700 }}
              >
                {placing ? "Placing Order…" : "Place Order →"}
              </button>

              <p style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "center", marginTop: "var(--space-3)" }}>
                By placing your order you agree to our terms.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
