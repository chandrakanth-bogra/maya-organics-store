import Image from "next/image";
import Link from "next/link";

const products = [
  { slug: "perlite", name: "Perlite", desc: "Superior drainage and aeration for any mix.", image: "perlite-jar.jpg" },
  { slug: "vermiculite", name: "Vermiculite", desc: "Moisture retention for seedlings and young roots.", image: "vermiculite-jar.jpg" },
  { slug: "pumice", name: "Pumice", desc: "Volcanic grit ideal for succulents and cacti.", image: "pumice-plain.jpg" },
  { slug: "leca", name: "LECA", desc: "Expanded clay for hydroponics and clean drainage.", image: "clayballs-jar.jpg" },
  { slug: "zeolite", name: "Zeolite", desc: "Natural mineral that locks in nutrients and moisture.", image: "zeolite-jar.jpg" },
  { slug: "cocopeat", name: "Cocopeat", desc: "Washed and buffered coir pith — India's finest organic base medium.", image: "cocopeat-plain.jpg" },
  { slug: "vermicompost", name: "Vermicompost", desc: "Living nutrition — growth hormones, microbes, full NPK.", image: "vermicompost-plain.jpg" },
  { slug: "neem-cake", name: "Neem Cake", desc: "Cold-pressed. Feeds your soil and defends your roots.", image: "neemcake-plain.jpg" },
];

const pillars = [
  {
    num: "01",
    title: "Horticultural Grade",
    body: "We stock only horticultural-grade amendments — not construction or industrial grade. Every product is screened, tested, and suitable for direct plant use without any treatment.",
  },
  {
    num: "02",
    title: "Pan-India Delivery",
    body: "We ship to Telangana and across all of India. From 500g sample pouches to bulk bags — delivered to your door with proper packaging that keeps your amendments dry and intact.",
  },
  {
    num: "03",
    title: "Grower Support",
    body: "From succulents to hydroponics, terrace vegetables to orchids — our guides and WhatsApp support help you find the exact product and ratio for your plants and your Telangana climate.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section
        className="textured"
        style={{ minHeight: "calc(88vh - var(--navbar-height))", display: "flex", alignItems: "center", backgroundColor: "var(--bg-page)" }}
      >
        <div className="container" style={{ padding: "var(--space-9) 0" }}>
          <div className="hero-grid">
            <div style={{ maxWidth: "520px" }}>
              <span className="eyebrow">Extracted from the earth</span>
              <h1 style={{ fontSize: "clamp(40px, 5vw, 72px)", color: "var(--green-dark)", lineHeight: 1.05, marginBottom: "var(--space-5)" }}>
                Grow better.<br /><em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>Naturally.</em>
              </h1>
              <p style={{ fontSize: "17px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "var(--space-6)", maxWidth: "420px" }}>
                The right substrate is the difference between a plant that survives and one that thrives. We deliver horticultural-grade amendments that serious growers use across the globe.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
                <Link href="/products" className="btn btn-primary">Shop Products</Link>
                <Link href="/about" className="btn-text">Our Story &rarr;</Link>
              </div>
            </div>

            <div style={{ position: "relative" }} className="hero-image-wrap">
              <Image
                src="/images/hero.jpg"
                alt="Maya Organics"
                width={600}
                height={560}
                className="hero-image"
                style={{ width: "100%", height: "560px", objectFit: "cover", borderRadius: "var(--radius-lg)" }}
                priority
              />
              <div style={{
                position: "absolute", bottom: "var(--space-5)", left: "var(--space-5)",
                background: "rgba(250,252,248,0.92)", backdropFilter: "blur(8px)",
                borderRadius: "var(--radius-md)", padding: "var(--space-4) var(--space-5)",
                display: "flex", alignItems: "center", gap: "var(--space-3)",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green-light)", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--green-dark)", letterSpacing: "0.03em" }}>Pan-India Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          <div style={{ marginBottom: "var(--space-7)" }}>
            <h2>The substrate is everything.<br />We&apos;ve got yours covered</h2>
          </div>
          <div className="home-products-grid">
            {products.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                <Image
                  src={`/images/${p.image}`}
                  alt={p.name}
                  width={300}
                  height={300}
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--radius-md)", backgroundColor: "var(--sand)" }}
                />
                <div style={{ padding: "var(--space-4) var(--space-1)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--green-dark)", marginBottom: "var(--space-1)" }}>{p.name}</div>
                  <div style={{ fontSize: "13px", fontWeight: 300, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>{p.desc}</div>
                  <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green-mid)" }}>View &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: "var(--space-7)", textAlign: "center" }}>
            <Link href="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* WHY MAYA ORGANICS */}
      <section className="section textured" style={{ backgroundColor: "var(--bg-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", marginInline: "auto", marginBottom: "var(--space-7)" }}>
            <span className="eyebrow">Why Maya Organics</span>
            <h2>Quality you can trust.</h2>
            <p>We source only horticultural-grade minerals, packed and shipped with care to growers across India.</p>
          </div>
          <div className="pillars-grid">
            {pillars.map((p) => (
              <div key={p.num} style={{ padding: "var(--space-6)", borderTop: "2px solid var(--border-default)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "40px", color: "var(--border-default)", lineHeight: 1, marginBottom: "var(--space-4)" }}>{p.num}</div>
                <h4 style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "var(--green-dark)", marginBottom: "var(--space-3)", letterSpacing: 0 }}>{p.title}</h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ backgroundColor: "var(--green-dark)", padding: "var(--space-9) 0", textAlign: "center" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--green-light)" }}>Ready to start?</span>
          <h2 style={{ color: "var(--white)", marginBottom: "var(--space-4)" }}>The right substrate<br />changes everything.</h2>
          <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.7)", marginBottom: "var(--space-6)", maxWidth: "480px", marginInline: "auto" }}>
            Browse our full range and find what your plants have been missing.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <Link href="/products" className="btn btn-outline-white">Shop Products</Link>
            <Link href="/contact" className="btn-text" style={{ color: "rgba(255,255,255,0.7)" }}>Get in Touch &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}
