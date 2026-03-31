import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Maya Organics",
  description: "Get in touch with Maya Organics. Ask about products, bulk orders, or shipping across India.",
};

const contactDetails = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "+91-76809-45577",
    href: "https://wa.me/917680945577",
    note: "Fastest way to reach us",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: "Email",
    value: "mayaorganics5577@gmail.com",
    href: "mailto:mayaorganics5577@gmail.com",
    note: "We reply within 1 business day",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Location",
    value: "Telangana, India",
    href: null,
    note: "Shipping pan-India",
  },
];

const faqs = [
  {
    q: "Do you ship outside Telangana?",
    a: "Yes — we ship pan-India. Delivery times vary by location. Enter your pincode at checkout to see estimated delivery and shipping cost.",
  },
  {
    q: "Do you offer bulk / wholesale pricing?",
    a: "Yes. Reach out on WhatsApp with your requirements and we'll quote accordingly. Minimum order quantities apply.",
  },
  {
    q: "Which product is right for my plants?",
    a: "Check our Guides section, or ask us directly on WhatsApp. Tell us what you're growing and we'll recommend the right amendment and ratio.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, credit/debit cards, and net banking via Razorpay. No cash on delivery.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* HEADER */}
      <section
        className="section-sm"
        style={{
          backgroundColor: "var(--bg-page)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="container">
          <span className="eyebrow">Get in touch</span>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 56px)", marginBottom: "var(--space-3)", color: "var(--green-dark)" }}>
            We&apos;d love to hear from you
          </h1>
          <p style={{ maxWidth: "520px", fontSize: "17px" }}>
            Questions about a product, a bulk order, or just need advice for your growing setup — reach out and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="section" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="container">
          <div className="product-detail-grid">

            {/* Left: contact info */}
            <div>
              <h3 style={{ marginBottom: "var(--space-6)" }}>Contact details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                {contactDetails.map((item) => (
                  <div key={item.label} style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--bg-subtle)",
                      border: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--green-dark)",
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "2px" }}>
                        {item.label}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          style={{ fontSize: "15px", fontWeight: 500, color: "var(--green-dark)" }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
                      )}
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <h3 style={{ marginBottom: "var(--space-5)" }}>Frequently asked</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                  {faqs.map((faq) => (
                    <div key={faq.q} style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-5)" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>{faq.q}</div>
                      <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.65 }}>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-default)",
                padding: "var(--space-7) var(--space-6)",
              }}
            >
              <h3 style={{ marginBottom: "var(--space-5)" }}>Send us a message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
