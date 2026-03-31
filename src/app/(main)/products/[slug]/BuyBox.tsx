"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export interface Variant {
  id: string;
  grain_size: string | null;
  pack_size: string;
  price: number;
  in_stock: boolean;
}

export default function BuyBox({ variants }: { variants: Variant[] }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const hasGrainSizes = variants.some((v) => v.grain_size);

  if (!selected) return null;

  const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setAdding(true);
    await addItem(selected.id, qty);
    setAdding(false);
  };

  return (
    <div className="pdp-sticky-col">
      <div style={{
        backgroundColor: "var(--bg-subtle)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-6)",
      }}>
        {/* In-stock status */}
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          color: selected.in_stock ? "#2e7d32" : "var(--accent-red)",
          marginBottom: "var(--space-4)",
        }}>
          {selected.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
        </div>

        {/* Grain size selector */}
        {hasGrainSizes && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "var(--space-2)" }}>
              Grain Size: <strong style={{ color: "var(--text-primary)" }}>{selected.grain_size}</strong>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {variants.map((v) => {
                const isActive = v.id === selectedId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    style={{
                      padding: "var(--space-2) var(--space-3)",
                      border: `1.5px solid ${isActive ? "var(--green-dark)" : "var(--border-default)"}`,
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: isActive ? "var(--green-dark)" : "transparent",
                      color: isActive ? "#fff" : "var(--text-primary)",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      lineHeight: 1.2,
                      textAlign: "center",
                      transition: "border-color 0.15s, background 0.15s, color 0.15s",
                    }}
                  >
                    {v.grain_size}
                    <span style={{ display: "block", fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>
                      {formatPrice(v.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "30px",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            {formatPrice(selected.price)}
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginLeft: "var(--space-2)" }}>
            / {selected.pack_size}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--green-dark)", fontWeight: 500, marginBottom: "var(--space-5)" }}>
          Free shipping on orders above ₹2,000
        </div>

        {/* Qty selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Qty</span>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{
                width: "30px", height: "30px",
                border: "1.5px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "transparent",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-primary)",
              }}
            >−</button>
            <span style={{
              fontSize: "15px", fontWeight: 600,
              minWidth: "24px", textAlign: "center",
              color: "var(--text-primary)",
            }}>
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              style={{
                width: "30px", height: "30px",
                border: "1.5px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "transparent",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-primary)",
              }}
            >+</button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !selected.in_stock}
          className="btn btn-primary"
          style={{
            width: "100%",
            marginBottom: "var(--space-5)",
            fontSize: "14px",
            padding: "14px 32px",
            opacity: (!selected.in_stock) ? 0.5 : 1,
            cursor: !selected.in_stock ? "not-allowed" : "pointer",
          }}
        >
          {!selected.in_stock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>

        {/* Delivery info */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border-default)", margin: "0 0 var(--space-4)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[
            { label: "Ships from", value: "Telangana, India" },
            { label: "Delivery", value: "Pan-India — 3 to 7 business days" },
            { label: "Free ship", value: "Orders above ₹2,000" },
            { label: "Payment", value: "UPI, Cards, Net Banking" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "var(--space-3)", fontSize: "12px" }}>
              <span style={{ color: "var(--text-secondary)", minWidth: "72px", flexShrink: 0, paddingTop: "1px" }}>
                {label}
              </span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
