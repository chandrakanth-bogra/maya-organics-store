import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { coupons } from "@/lib/db/schema";

// GET /api/coupon?code=XXX&subtotal=XXXXX
export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();
  const subtotal = parseInt(searchParams.get("subtotal") ?? "0");

  if (!code) return NextResponse.json({ error: "No code provided." }, { status: 400 });

  const coupon = await db.query.coupons.findFirst({
    where: and(eq(coupons.code, code), eq(coupons.active, true)),
  });

  if (!coupon) return NextResponse.json({ error: "Invalid or inactive coupon." }, { status: 400 });

  const now = new Date().toISOString();
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
  }
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return NextResponse.json({
      error: `Minimum order ₹${(coupon.minOrderAmount / 100).toLocaleString("en-IN")} required.`,
    }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
  }

  const discount = coupon.discountType === "percent"
    ? Math.round((subtotal * coupon.value) / 100)
    : coupon.value;

  return NextResponse.json({
    discount,
    code: coupon.code,
    label: coupon.discountType === "percent" ? `${coupon.value}% off` : `₹${coupon.value / 100} off`,
  });
}
