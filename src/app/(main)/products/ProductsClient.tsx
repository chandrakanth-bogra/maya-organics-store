"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "./page";

const CATEGORIES = ["All", "Minerals", "Organic"];

function getCategoryGroup(category: string): string {
  const organics = ["Organic Medium", "Organic Fertiliser", "Organic Soil Amendment"];
  return organics.includes(category) ? "Organic" : "Minerals";
}

function formatPrice(paise: number): string {
  return `₹${paise / 100}`;
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? products
      : products.filter((p) => getCategoryGroup(p.category) === filter);

  return (
    <>
      {/* PAGE HEADER */}
      <section className="section-sm textured" style={{ backgroundColor: "var(--bg-subtle)" }}>
        <div className="container">
          <span className="eyebrow">Our Range</span>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 56px)", marginBottom: "var(--space-4)" }}>
            Soil amendments for<br />
            <em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>every grower</em>
          </h1>
          <p style={{ fontSize: "16px", maxWidth: "520px", color: "var(--text-secondary)", margin: 0 }}>
            8 horticultural-grade products — from volcanic minerals to living organics.
            Sourced, tested, and shipped pan-India.
          </p>
        </div>
      </section>

      {/* FILTER TABS + GRID */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          {/* Filter tabs */}
          <div className="filter-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "8px 20px",
                  borderRadius: "var(--radius-sm)",
                  color: filter === cat ? "var(--white)" : "var(--text-secondary)",
                  backgroundColor: filter === cat ? "var(--green-dark)" : "transparent",
                  border: `1.5px solid ${filter === cat ? "var(--green-dark)" : "var(--border-default)"}`,
                  cursor: "pointer",
                  transition: "var(--ease)",
                  flexShrink: 0,
                  fontFamily: "var(--font-body)",
                }}
              >
                {cat}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 300, color: "var(--text-secondary)", alignSelf: "center", flexShrink: 0 }}>
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Product grid */}
          <div className="products-grid">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <div
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    overflow: "hidden",
                    transition: "var(--ease)",
                    backgroundColor: "var(--bg-surface)",
                  }}
                  className="product-card"
                >
                  {/* Image */}
                  <div style={{ position: "relative", backgroundColor: "var(--bg-subtle)" }}>
                    <Image
                      src={`/images/${p.image_main}`}
                      alt={p.name}
                      width={500}
                      height={400}
                      style={{ width: "100%", height: "240px", objectFit: "cover" }}
                    />
                    {!p.in_stock && (
                      <div style={{
                        position: "absolute", top: "var(--space-4)", left: "var(--space-4)",
                        background: "rgba(26,26,26,0.75)", color: "#fff",
                        fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em",
                        textTransform: "uppercase", padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                      }}>
                        Out of stock
                      </div>
                    )}
                    <div style={{
                      position: "absolute", top: "var(--space-4)", right: "var(--space-4)",
                      background: "rgba(250,252,248,0.9)", backdropFilter: "blur(6px)",
                      fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "var(--green-dark)",
                      padding: "4px 10px", borderRadius: "var(--radius-sm)",
                    }}>
                      {p.category}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "var(--space-5)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--green-dark)", marginBottom: "var(--space-2)", lineHeight: 1.2 }}>
                      {p.name}
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--space-4)", minHeight: "40px" }}>
                      {p.tagline}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--green-dark)" }}>
                          {formatPrice(p.price)}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 300, color: "var(--text-secondary)", marginLeft: "4px" }}>
                          / {p.price_unit}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green-mid)" }}>
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--space-9) 0", color: "var(--text-secondary)" }}>
              No products found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
