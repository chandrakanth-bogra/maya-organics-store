import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides | Maya Organics",
  description: "Growing guides for soil amendments, potting mixes, hydroponics, and organic inputs — from the team at Maya Organics.",
};

const categories = ["All", ...Array.from(new Set(guides.map((g) => g.category)))];

export default function GuidesPage() {
  return (
    <>
      {/* HEADER */}
      <section
        className="section-sm textured"
        style={{
          backgroundColor: "var(--bg-page)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="container">
          <span className="eyebrow">Grower resources</span>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 56px)", marginBottom: "var(--space-3)", color: "var(--green-dark)" }}>
            Guides & growing tips
          </h1>
          <p style={{ maxWidth: "520px", fontSize: "17px" }}>
            Practical guides on potting mixes, amendments, hydroponics, and organic inputs — written for Indian growing conditions.
          </p>
        </div>
      </section>

      {/* GUIDES GRID */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          {/* Category pills — static display, no filtering for now */}
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-7)" }}>
            {categories.map((cat) => (
              <span
                key={cat}
                style={{
                  padding: "6px 16px",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  backgroundColor: cat === "All" ? "var(--green-dark)" : "var(--bg-subtle)",
                  color: cat === "All" ? "#fff" : "var(--text-secondary)",
                  border: "1px solid",
                  borderColor: cat === "All" ? "var(--green-dark)" : "var(--border-default)",
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="products-grid">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <article
                  style={{
                    backgroundColor: "var(--bg-page)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-6)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "var(--ease)",
                  }}
                  className="product-card"
                >
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--green-mid)",
                      backgroundColor: "var(--bg-subtle)",
                      border: "1px solid var(--border-default)",
                      padding: "4px 10px",
                      borderRadius: "100px",
                    }}>
                      {guide.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "22px",
                      color: "var(--green-dark)",
                      lineHeight: 1.2,
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    {guide.title}
                  </h3>

                  <p style={{ fontSize: "14px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.65, flexGrow: 1, margin: 0 }}>
                    {guide.excerpt}
                  </p>

                  <div style={{ marginTop: "var(--space-5)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{guide.readTime}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--green-mid)" }}>
                      Read &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-subtle)", textAlign: "center" }}>
        <div className="container">
          <h3 style={{ marginBottom: "var(--space-3)" }}>Still have questions?</h3>
          <p style={{ maxWidth: "400px", marginInline: "auto", marginBottom: "var(--space-5)" }}>
            Ask us directly on WhatsApp. Tell us what you&apos;re growing and we&apos;ll recommend the right products and ratios.
          </p>
          <a href="https://wa.me/917680945577" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
