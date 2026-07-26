"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setError("");
  };

  const handleSignIn = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message ?? "Failed to sign in.");
    } else {
      setLoading(false);
      router.push(next);
      router.refresh();
    }
  };

  const handleSignUp = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
    });
    if (error) {
      setLoading(false);
      setError(error.message ?? "Failed to create account.");
      return;
    }
    setLoading(false);
    router.push(next);
    router.refresh();
  };

  return (
    <div
      className="section"
      style={{ minHeight: "calc(100vh - var(--navbar-height))", display: "flex", alignItems: "center" }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: "440px",
            margin: "0 auto",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-7) var(--space-6)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            <Image src="/images/MayaOrganics-logo.svg" alt="Maya Organics" width={140} height={36} style={{ margin: "0 auto", marginBottom: "var(--space-4)" }} />
            <h3 style={{ marginBottom: 0 }}>
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h3>
          </div>

          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "4px",
              marginBottom: "var(--space-5)",
            }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "calc(var(--radius-sm) - 2px)",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  background: mode === m ? "var(--bg-surface)" : "transparent",
                  color: mode === m ? "var(--green-dark)" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  transition: "var(--ease)",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                }}
              >
                {m === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp}>
            {mode === "signup" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={mode === "signin"}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="········"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p style={{ color: "var(--accent-red)", fontSize: "13px", marginBottom: "var(--space-4)" }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
