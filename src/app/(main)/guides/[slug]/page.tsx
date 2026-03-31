import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuide } from "@/lib/guides";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Maya Organics Guides`,
    description: guide.excerpt,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

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
        <div className="container" style={{ maxWidth: "760px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <Link
              href="/guides"
              style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}
            >
              ← Guides
            </Link>
            <span style={{ color: "var(--border-default)" }}>·</span>
            <span style={{
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
            <span style={{ color: "var(--border-default)" }}>·</span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{guide.readTime}</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: "var(--space-4)", color: "var(--green-dark)", lineHeight: 1.15 }}>
            {guide.title}
          </h1>
          <p style={{ fontSize: "17px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
            {guide.excerpt}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container" style={{ maxWidth: "760px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {guide.content.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <h3 style={{ marginBottom: "var(--space-3)", fontSize: "clamp(18px, 2vw, 22px)" }}>
                    {section.heading}
                  </h3>
                )}
                <p style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: section.list ? "var(--space-3)" : 0 }}>
                  {section.body}
                </p>
                {section.list && (
                  <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingLeft: "var(--space-5)" }}>
                    {section.list.map((item, j) => (
                      <li
                        key={j}
                        style={{
                          fontSize: "15px",
                          fontWeight: 300,
                          color: "var(--text-secondary)",
                          lineHeight: 1.7,
                          listStyleType: "disc",
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-default)", marginTop: "var(--space-8)", paddingTop: "var(--space-7)" }}>
            <h3 style={{ marginBottom: "var(--space-3)" }}>Browse our products</h3>
            <p style={{ marginBottom: "var(--space-5)" }}>
              All amendments mentioned in this guide are in stock and ready to ship pan-India.
            </p>
            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <Link href="/products" className="btn btn-primary">Shop Products</Link>
              <Link href="/guides" className="btn btn-outline">More Guides</Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-subtle)", textAlign: "center" }}>
        <div className="container">
          <h3 style={{ marginBottom: "var(--space-3)" }}>Have a question about this guide?</h3>
          <p style={{ maxWidth: "400px", marginInline: "auto", marginBottom: "var(--space-5)" }}>
            Message us on WhatsApp and we&apos;ll help you apply these techniques to your specific plants and setup.
          </p>
          <a href="https://wa.me/917680945577" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
