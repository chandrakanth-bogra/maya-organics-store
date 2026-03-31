import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { address, coupon_code } = await req.json();

  if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
    return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Fetch cart items with variant prices
  const { data: cartItems } = await admin
    .from("cart_items")
    .select("id, variant_id, quantity, variant:product_variants(price)")
    .eq("user_id", user.id);

  if (!cartItems?.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // 2. Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = (item.variant as any)?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // 3. Coupon or volume discount (whichever applies — don't stack)
  let discount = 0;
  let applied_coupon: string | null = null;

  if (coupon_code) {
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", coupon_code.trim().toUpperCase())
      .eq("active", true)
      .single();

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon." }, { status: 400 });
    }
    const now = new Date().toISOString();
    if (coupon.expires_at && coupon.expires_at < now) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
    }
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json({ error: `Minimum order ₹${(coupon.min_order_amount / 100).toLocaleString("en-IN")} required.` }, { status: 400 });
    }
    if (coupon.usage_limit && (coupon.times_used ?? 0) >= coupon.usage_limit) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }
    discount = coupon.discount_type === "percent"
      ? Math.round(subtotal * coupon.value / 100)
      : coupon.value;
    applied_coupon = coupon.code;
    await admin.from("coupons").update({ times_used: (coupon.times_used ?? 0) + 1 }).eq("id", coupon.id);
  } else {
    // Auto-apply best volume discount
    const { data: tiers } = await admin
      .from("volume_discounts")
      .select("*")
      .lte("min_order_amount", subtotal)
      .order("min_order_amount", { ascending: false })
      .limit(1);
    if (tiers?.length) {
      discount = Math.round(subtotal * tiers[0].discount_percent / 100);
    }
  }

  const total = Math.max(0, subtotal - discount);

  // 4. Create order
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "confirmed",
      subtotal,
      discount,
      total,
      coupon_code: applied_coupon,
      shipping_address: address,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }

  // 5. Create order_items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price_at_purchase: (item.variant as any)?.price ?? 0,
  }));
  await admin.from("order_items").insert(orderItems);

  // 6. Clear cart
  await admin.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ order_id: order.id });
}
