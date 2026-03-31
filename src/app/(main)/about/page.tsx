import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Maya Organics",
  description: "Maya Organics supplies premium horticultural-grade soil amendments to home gardeners and professional growers across India.",
};

const values = [
  {
    num: "01",
    title: "Horticultural Grade Only",
    body: "We source perlite, vermiculite, pumice, and every other amendment at horticultural grade — not construction or industrial. The difference matters: particle size, purity, and pH are calibrated for plant use.",
  },
  {
    num: "02",
    title: "No Compromises on Sourcing",
    body: "Every batch is screened before it reaches you. We reject material that doesn't meet our standards — even if it's cheaper. Our growers depend on consistency, and we take that seriously.",
  },
  {
    num: "03",
    title: "Grower-First Support",
    body: "Whether you're building a cactus mix, setting up a hydro system, or top-dressing an orchid — we'll help you find the right product and ratio. Guides, WhatsApp support, and honest advice.",
  },
  {
    num: "04",
    title: "Pan-India Delivery",
    body: "We ship from Telangana to every corner of India. From 500g sample pouches to bulk bags, everything is packed to arrive dry and intact — no wet cocopeat, no crushed perlite.",
  },
];


export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section
        className="section textured"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="container" style={{ maxWidth: "720px" }}>
          <span className="eyebrow">Our story</span>
          <h1 style={{ marginBottom: "var(--space-5)", color: "var(--green-dark)" }}>
            Grow better.<br /><em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>Naturally.</em>
          </h1>
          <p style={{ fontSize: "18px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: "580px" }}>
            Maya Organics was born from a simple frustration: finding horticultural-grade soil amendments in India was harder than it should be. Construction-grade perlite in garden shops. Diluted vermicompost. Mystery mixes with no label.
          </p>
          <p style={{ fontSize: "18px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: "580px" }}>
            We fixed that. Based in Telangana, we source, test, and ship premium amendments — perlite, vermiculite, cocopeat, LECA, and more — to home gardeners and professional growers across India.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          <div style={{ marginBottom: "var(--space-7)" }}>
            <span className="eyebrow">What we stand for</span>
            <h2>The Maya Organics standard</h2>
          </div>
          <div className="home-products-grid">
            {values.map((v) => (
              <div key={v.num} style={{ padding: "var(--space-6)", borderTop: "2px solid var(--border-default)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: "var(--border-default)", lineHeight: 1, marginBottom: "var(--space-4)" }}>{v.num}</div>
                <h4 style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "var(--green-dark)", marginBottom: "var(--space-3)", letterSpacing: 0 }}>{v.title}</h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY / MISSION */}
      <section className="section textured" style={{ backgroundColor: "var(--bg-subtle)" }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Why we exist</span>
              <h2 style={{ marginBottom: "var(--space-5)" }}>The substrate is the foundation</h2>
              <p>
                Most plant problems start underground. Compacted soil, poor drainage, nutrient lockout — these aren't plant problems, they're substrate problems. And they're completely preventable with the right amendments.
              </p>
              <p>
                We believe every grower — from a first-time balcony gardener in Hyderabad to a commercial greenhouse in the hills — deserves access to the same quality inputs that professionals use around the world.
              </p>
              <p style={{ marginBottom: "var(--space-6)" }}>
                That's why we stock only horticultural grade. That's why we label every bag clearly. And that's why we answer your WhatsApp questions about ratios at 11pm.
              </p>
              <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <Link href="/products" className="btn btn-primary">Shop Products</Link>
                <Link href="/guides" className="btn btn-outline">Read Our Guides</Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
              {[
                { stat: "8", label: "Premium amendments" },
                { stat: "100%", label: "Horticultural grade" },
                { stat: "Pan-India", label: "Delivery coverage" },
                { stat: "Telangana", label: "Based in" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "var(--space-6)",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", color: "var(--green-dark)", lineHeight: 1, marginBottom: "var(--space-2)" }}>{item.stat}</div>
                  <div style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section style={{ backgroundColor: "var(--green-dark)", padding: "var(--space-9) 0", textAlign: "center" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--green-light)" }}>Get in touch</span>
          <h2 style={{ color: "var(--white)", marginBottom: "var(--space-4)" }}>Questions? We&apos;re here.</h2>
          <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.7)", marginBottom: "var(--space-6)", maxWidth: "420px", marginInline: "auto" }}>
            Ask us anything about our products, ratios, or shipping. We respond fast on WhatsApp.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <a href="https://wa.me/917680945577" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white">Chat on WhatsApp</a>
            <Link href="/contact" className="btn-text" style={{ color: "rgba(255,255,255,0.7)" }}>Send a message &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}
