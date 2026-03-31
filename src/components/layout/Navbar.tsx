"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { dark } = useTheme();
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: "var(--bg-navbar)",
        borderBottom: scrolled ? "1px solid var(--border-default)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "var(--ease)",
      }}
      data-scrolled={scrolled}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Image
            src="/images/MayaOrganics-logo.svg"
            alt="Maya Organics"
            width={180}
            height={44}
            style={{ height: "44px", width: "auto", maxWidth: "180px", objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <ul
          style={{
            alignItems: "center",
            gap: "var(--space-6)",
            listStyle: "none",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: pathname === link.href ? "var(--green-dark)" : "var(--grey-mid)",
                  paddingBottom: "2px",
                  borderBottom: pathname === link.href ? "1.5px solid var(--green-light)" : "1.5px solid transparent",
                  transition: "var(--ease)",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Auth link */}
          <li>
            {user ? (
              <Link
                href="/account"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--green-dark)",
                  paddingBottom: "2px",
                  borderBottom: pathname === "/account" ? "1.5px solid var(--green-light)" : "1.5px solid transparent",
                  transition: "var(--ease)",
                }}
              >
                Account
              </Link>
            ) : (
              <Link
                href="/auth/login"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--green-dark)",
                  paddingBottom: "2px",
                  borderBottom: pathname === "/auth/login" ? "1.5px solid var(--green-light)" : "1.5px solid transparent",
                  transition: "var(--ease)",
                }}
              >
                Login
              </Link>
            )}
          </li>
        </ul>

        {/* Right side: cart + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          {/* Cart icon */}
          <Link
            href="/cart"
            aria-label="Cart"
            style={{ position: "relative", display: "flex", alignItems: "center", color: "var(--green-dark)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-6px",
                right: "-8px",
                backgroundColor: "var(--green-dark)",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                lineHeight: 1,
                padding: "2px 5px",
                borderRadius: "10px",
                minWidth: "16px",
                textAlign: "center",
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              flexDirection: "column",
              gap: "5px",
              cursor: "pointer",
              padding: "4px",
              background: "none",
              border: "none",
            }}
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "var(--green-dark)", borderRadius: "2px", transition: "var(--ease)" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "var(--green-dark)", borderRadius: "2px", transition: "var(--ease)" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "var(--green-dark)", borderRadius: "2px", transition: "var(--ease)" }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ backgroundColor: "var(--bg-navbar)", borderTop: "1px solid var(--border-default)", padding: "var(--space-5) 0" }}>
          <ul className="container" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: pathname === link.href ? "var(--green-dark)" : "var(--text-secondary)",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Mobile auth link */}
            <li>
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--green-dark)",
                  }}
                >
                  Account
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--green-dark)",
                  }}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
