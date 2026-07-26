"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { changePassword as authChangePassword, updateUser as authUpdateUser } from "@/lib/auth-client";

/* ── Types ── */
interface Profile {
  name: string;
  phone: string;
}

interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const EMPTY_ADDRESS: Omit<Address, "id" | "is_default"> = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

interface Order { id: string; status: string; total: number; created_at: string; }

const statusColor: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  shipped:   { bg: "#ede9fe", text: "#5b21b6" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

type Tab = "profile" | "addresses" | "security" | "orders";

/* ── Component ── */
export default function AccountClient() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  /* Profile state */
  const [profile, setProfile] = useState<Profile>({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  /* Address state */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [addrMsg, setAddrMsg] = useState("");

  /* Security state */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  /* Orders state */
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* Redirect if not logged in */
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  /* Load profile */
  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name ?? "",
      phone: (user as { phone?: string }).phone ?? "",
    });
  }, [user]);

  /* Load addresses */
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setAddrLoading(true);
    const res = await fetch("/api/account/addresses");
    if (res.ok) {
      const { addresses: data } = await res.json();
      setAddresses(data ?? []);
    }
    setAddrLoading(false);
  }, [user]);

  useEffect(() => {
    if (tab === "addresses") fetchAddresses();
  }, [tab, fetchAddresses]);

  useEffect(() => {
    if (tab !== "orders" || !user) return;
    setOrdersLoading(true);
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then(({ orders: data }) => { setOrders(data ?? []); setOrdersLoading(false); });
  }, [tab, user]);

  if (authLoading || !user) return null;

  /* ── Profile save ── */
  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg("");
    const { error } = await authUpdateUser({ name: profile.name, phone: profile.phone || undefined });
    setProfileMsg(error ? error.message ?? "Something went wrong." : "Saved successfully.");
    setProfileSaving(false);
  };

  /* ── Address helpers ── */
  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm(EMPTY_ADDRESS);
    setAddrMsg("");
    setShowAddrForm(true);
  };

  const openEditAddr = (a: Address) => {
    setEditingAddr(a);
    setAddrForm({ label: a.label, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode });
    setAddrMsg("");
    setShowAddrForm(true);
  };

  const saveAddress = async () => {
    if (!addrForm.line1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      setAddrMsg("Please fill in all required fields.");
      return;
    }
    setAddrMsg("");
    if (editingAddr) {
      const res = await fetch(`/api/account/addresses/${editingAddr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForm),
      });
      if (!res.ok) { setAddrMsg("Failed to update address."); return; }
    } else {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addrForm),
      });
      if (!res.ok) { setAddrMsg("Failed to save address."); return; }
    }
    setShowAddrForm(false);
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    fetchAddresses();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    fetchAddresses();
  };

  /* ── Password change ── */
  const changePassword = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwMsg("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    setPwMsg("");
    const { error } = await authChangePassword({
      currentPassword: pwForm.current,
      newPassword: pwForm.next,
    });
    if (error) {
      setPwMsg(error.message ?? "Current password is incorrect.");
    } else {
      setPwMsg("Password updated successfully.");
      setPwForm({ current: "", next: "", confirm: "" });
    }
    setPwSaving(false);
  };

  /* ── UI ── */
  const tabStyle = (t: Tab) => ({
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "var(--space-3) var(--space-4)",
    fontSize: "13px",
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? "var(--green-dark)" : "var(--text-secondary)",
    backgroundColor: tab === t ? "rgba(0,100,0,0.06)" : "transparent",
    border: "none",
    borderLeft: `2px solid ${tab === t ? "var(--green-dark)" : "transparent"}`,
    cursor: "pointer",
    textAlign: "left" as const,
    fontFamily: "var(--font-body)",
    letterSpacing: "0.02em",
    transition: "background 0.15s, color 0.15s",
  } as React.CSSProperties);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "var(--bg-page)",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "var(--space-2)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const fieldGroup = (label: string, input: React.ReactNode) => (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <label style={labelStyle}>{label}</label>
      {input}
    </div>
  );

  return (
    <>
      {/* Header */}
      <section className="section-sm" style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="container">
          <span className="eyebrow">Account</span>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 36px)", color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            {profile.name ? `Hi, ${profile.name.split(" ")[0]}` : "My Account"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>{user.email}</p>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="section" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="container">
          <div className="account-layout">

            {/* Left sidebar */}
            <div className="account-sidebar" style={{
              width: "200px",
              flexShrink: 0,
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}>
              <div className="account-sidebar-label" style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--border-default)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  My Account
                </div>
              </div>
              <nav style={{ padding: "var(--space-2) 0" }}>
                {(["profile", "addresses", "orders", "security"] as Tab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </nav>
              <div className="account-sidebar-signout" style={{ borderTop: "1px solid var(--border-default)", padding: "var(--space-2) 0" }}>
                <button
                  onClick={signOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "var(--space-3) var(--space-4)",
                    fontSize: "13px",
                    color: "var(--accent-red)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderLeft: "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Right content */}
            <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Profile ── */}
          {tab === "profile" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-6)", color: "var(--text-primary)" }}>Profile Details</h3>
              {fieldGroup("Full Name",
                <input
                  style={inputStyle}
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
              )}
              {fieldGroup("Email",
                <input
                  style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                  value={user.email ?? ""}
                  readOnly
                />
              )}
              {fieldGroup("Phone (optional)",
                <input
                  style={inputStyle}
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              )}
              {profileMsg && (
                <p style={{ fontSize: "13px", color: profileMsg.includes("aved") ? "#2e7d32" : "var(--accent-red)", marginBottom: "var(--space-4)" }}>
                  {profileMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <button onClick={saveProfile} disabled={profileSaving} className="btn btn-primary">
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={signOut} className="btn btn-outline" style={{ fontSize: "13px" }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* ── Addresses ── */}
          {tab === "addresses" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
                <h3 style={{ color: "var(--text-primary)", margin: 0 }}>Saved Addresses</h3>
                {!showAddrForm && (
                  <button onClick={openAddAddr} className="btn btn-outline" style={{ fontSize: "13px" }}>
                    + Add Address
                  </button>
                )}
              </div>

              {/* Address form */}
              {showAddrForm && (
                <div style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", marginBottom: "var(--space-6)" }}>
                  <h4 style={{ marginBottom: "var(--space-5)", color: "var(--text-primary)" }}>
                    {editingAddr ? "Edit Address" : "New Address"}
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      {fieldGroup("Label",
                        <input style={inputStyle} value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} placeholder="Home / Office" />
                      )}
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      {fieldGroup("Address Line 1 *",
                        <input style={inputStyle} value={addrForm.line1} onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))} placeholder="House / Flat / Building" />
                      )}
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      {fieldGroup("Address Line 2",
                        <input style={inputStyle} value={addrForm.line2} onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))} placeholder="Street / Area (optional)" />
                      )}
                    </div>
                    <div>
                      {fieldGroup("City *",
                        <input style={inputStyle} value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} />
                      )}
                    </div>
                    <div>
                      {fieldGroup("State *",
                        <input style={inputStyle} value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} />
                      )}
                    </div>
                    <div>
                      {fieldGroup("Pincode *",
                        <input style={inputStyle} value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} placeholder="500001" maxLength={6} />
                      )}
                    </div>
                  </div>
                  {addrMsg && (
                    <p style={{ fontSize: "13px", color: "var(--accent-red)", marginBottom: "var(--space-3)" }}>{addrMsg}</p>
                  )}
                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <button onClick={saveAddress} className="btn btn-primary" style={{ fontSize: "13px" }}>
                      {editingAddr ? "Update" : "Save Address"}
                    </button>
                    <button onClick={() => setShowAddrForm(false)} className="btn btn-outline" style={{ fontSize: "13px" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Address list */}
              {addrLoading ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading…</p>
              ) : addresses.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No addresses saved yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  {addresses.map((a) => (
                    <div key={a.id} style={{
                      padding: "var(--space-5)",
                      backgroundColor: "var(--bg-subtle)",
                      border: `1px solid ${a.is_default ? "var(--green-dark)" : "var(--border-default)"}`,
                      borderRadius: "var(--radius-md)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{a.label}</span>
                          {a.is_default && (
                            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green-dark)", backgroundColor: "rgba(0,100,0,0.08)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                              Default
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "var(--space-3)" }}>
                          {!a.is_default && (
                            <button onClick={() => setDefault(a.id)} style={{ fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-body)" }}>
                              Set default
                            </button>
                          )}
                          <button onClick={() => openEditAddr(a)} style={{ fontSize: "12px", color: "var(--green-dark)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-body)" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteAddress(a.id)} style={{ fontSize: "12px", color: "var(--accent-red)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-body)" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                        {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                        {a.city}, {a.state} — {a.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Orders ── */}
          {tab === "orders" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-6)", color: "var(--text-primary)" }}>My Orders</h3>
              {ordersLoading ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading…</p>
              ) : orders.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No orders yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {orders.map((o) => {
                    const sc = statusColor[o.status] ?? { bg: "#f3f4f6", text: "#374151" };
                    return (
                      <Link key={o.id} href={`/account/orders/${o.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ padding: "var(--space-4) var(--space-5)", backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)" }}>
                          <div>
                            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>{o.id.slice(0, 8)}…</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>₹{(o.total / 100).toLocaleString("en-IN")}</span>
                            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "3px", backgroundColor: sc.bg, color: sc.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>{o.status}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>→</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Security ── */}
          {tab === "security" && (
            <div>
              <h3 style={{ marginBottom: "var(--space-6)", color: "var(--text-primary)" }}>Change Password</h3>
              {fieldGroup("Current Password",
                <input
                  style={inputStyle}
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  autoComplete="current-password"
                />
              )}
              {fieldGroup("New Password",
                <input
                  style={inputStyle}
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                />
              )}
              {fieldGroup("Confirm New Password",
                <input
                  style={inputStyle}
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  autoComplete="new-password"
                />
              )}
              {pwMsg && (
                <p style={{ fontSize: "13px", color: pwMsg.includes("uccessfully") ? "#2e7d32" : "var(--accent-red)", marginBottom: "var(--space-4)" }}>
                  {pwMsg}
                </p>
              )}
              <button onClick={changePassword} disabled={pwSaving} className="btn btn-primary">
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          )}

            </div>{/* end right content */}
          </div>{/* end flex row */}
        </div>{/* end container */}
      </section>
    </>
  );
}
