export type ProductSpec = { label: string; value: string };

export type ShippingAddress = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type CouponDiscountType = "percent" | "flat";
