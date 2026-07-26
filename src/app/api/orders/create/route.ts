import { NextResponse } from "next/server";
import { eq, and, lte, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cartItems, coupons, volumeDiscounts, orders, orderItems } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";
import type { ShippingAddress } from "@/lib/db/schema";

export async function POST(req: Request) {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const user = auth.user;

  const { address, coupon_code } = await req.json();

  if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
    return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
  }

  const shippingAddress: ShippingAddress = {
    label: address.label ?? "Home",
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };

  // 1. Fetch cart items with variant prices
  const cart = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, user.id),
    with: { variant: { columns: { price: true } } },
  });

  if (!cart.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // 2. Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  // 3. Coupon or volume discount (whichever applies — don't stack)
  let discount = 0;
  let appliedCoupon: string | null = null;
  let matchedCouponId: string | null = null;

  if (coupon_code) {
    const code = String(coupon_code).trim().toUpperCase();
    const coupon = await db.query.coupons.findFirst({
      where: and(eq(coupons.code, code), eq(coupons.active, true)),
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon." }, { status: 400 });
    }
    const now = new Date().toISOString();
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order ₹${(coupon.minOrderAmount / 100).toLocaleString("en-IN")} required.` },
        { status: 400 }
      );
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }
    discount = coupon.discountType === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
    appliedCoupon = coupon.code;
    matchedCouponId = coupon.id;
  } else {
    // Auto-apply best volume discount
    const tier = await db.query.volumeDiscounts.findFirst({
      where: lte(volumeDiscounts.minOrderAmount, subtotal),
      orderBy: desc(volumeDiscounts.minOrderAmount),
    });
    if (tier) {
      discount = Math.round((subtotal * tier.discountPercent) / 100);
    }
  }

  const total = Math.max(0, subtotal - discount);

  // 4-7: create order, order items, increment coupon usage, clear cart — atomically
  const orderId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id: orderId,
      userId: user.id,
      status: "confirmed",
      subtotal,
      discount,
      total,
      couponCode: appliedCoupon,
      shippingAddress,
    });

    for (const item of cart) {
      await tx.insert(orderItems).values({
        orderId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: item.variant.price,
      });
    }

    if (matchedCouponId) {
      await tx.update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.id, matchedCouponId));
    }

    await tx.delete(cartItems).where(eq(cartItems.userId, user.id));
  });

  return NextResponse.json({ order_id: orderId });
}
