import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// GET /api/coupon?code=XXX&subtotal=XXXXX
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();
  const subtotal = parseInt(searchParams.get("subtotal") ?? "0");

  if (!code) return NextResponse.json({ error: "No code provided." }, { status: 400 });

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (!coupon) return NextResponse.json({ error: "Invalid or inactive coupon." }, { status: 400 });

  const now = new Date().toISOString();
  if (coupon.expires_at && coupon.expires_at < now) {
    return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
  }
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return NextResponse.json({
      error: `Minimum order ₹${(coupon.min_order_amount / 100).toLocaleString("en-IN")} required.`,
    }, { status: 400 });
  }
  if (coupon.usage_limit && (coupon.times_used ?? 0) >= coupon.usage_limit) {
    return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
  }

  const discount = coupon.discount_type === "percent"
    ? Math.round(subtotal * coupon.value / 100)
    : coupon.value;

  return NextResponse.json({ discount, code: coupon.code, label: coupon.discount_type === "percent" ? `${coupon.value}% off` : `₹${coupon.value / 100} off` });
}
