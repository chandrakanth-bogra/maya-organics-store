import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <>
      <footer style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF", padding: "var(--space-9) 0 var(--space-5)" }}>
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <Image
                src="/images/MayaOrganics-logo.svg"
                alt="Maya Organics"
                width={160}
                height={32}
                style={{ height: "32px", width: "auto", maxWidth: "160px", objectFit: "contain", marginBottom: "var(--space-4)", filter: "brightness(0) invert(1)", opacity: 0.9 }}
              />
              <p style={{ fontSize: "13px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: 0 }}>
                Premium soil amendments for home gardeners and professional growers across India.
              </p>
            </div>

            {/* Products */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-5)" }}>
                Products
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", listStyle: "none" }}>
                {["Perlite", "Vermiculite", "Pumice", "LECA", "Zeolite", "Cocopeat", "Vermicompost", "Neem Cake"].map((p) => (
                  <li key={p}>
                    <Link href={`/products/${p.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "14px", fontWeight: 300, color: "rgba(255,255,255,0.65)" }}>
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-5)" }}>
                Company
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", listStyle: "none" }}>
                {[{ href: "/about", label: "About" }, { href: "/guides", label: "Guides" }, { href: "/contact", label: "Contact" }].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: "14px", fontWeight: 300, color: "rgba(255,255,255,0.65)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-5)" }}>
                Contact
              </div>
              {[
                { label: "Email", value: "mayaorganics5577@gmail.com" },
                { label: "WhatsApp", value: "+91-76809-45577" },
                { label: "Location", value: "Telangana, India" },
              ].map((item) => (
                <div key={item.label} style={{ fontSize: "13px", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "var(--space-3)" }}>
                  <strong style={{ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "2px" }}>
                    {item.label}
                  </strong>
                  {item.value}
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: "var(--space-5)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              &copy; {new Date().getFullYear()} Maya Organics. All rights reserved.
            </p>
            <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Telangana, India
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp float */}
      <a href="https://wa.me/917680945577" target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
