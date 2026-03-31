"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to API route / email service
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-6)" }}>
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green-dark)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto var(--space-5)" }}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3 style={{ marginBottom: "var(--space-3)" }}>Message received</h3>
        <p style={{ fontSize: "14px", maxWidth: "320px", marginInline: "auto" }}>
          Thank you, {name.split(" ")[0]}. We&apos;ll get back to you at {email} within one business day.
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "var(--space-4)" }}>
          For faster replies, chat with us on{" "}
          <a href="https://wa.me/917680945577" target="_blank" rel="noopener noreferrer" style={{ color: "var(--green-dark)", fontWeight: 500 }}>
            WhatsApp
          </a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Your Name</label>
        <input
          className="form-control"
          type="text"
          placeholder="Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          className="form-control"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Message</label>
        <textarea
          className="form-control"
          placeholder="Ask us about products, ratios, shipping, bulk orders..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ resize: "vertical", minHeight: "120px" }}
        />
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
