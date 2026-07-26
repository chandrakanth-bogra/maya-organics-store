import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import type {
  ProductSpec,
  ShippingAddress,
  OrderStatus,
  CouponDiscountType,
} from "./types";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export const addresses = sqliteTable("addresses", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const products = sqliteTable("products", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  tagline: text("tagline"),
  metaDescription: text("meta_description"),
  price: integer("price").notNull(),
  priceUnit: text("price_unit").notNull().default("225g pouch"),
  imageMain: text("image_main"),
  imageThumb: text("image_thumb"),
  highlights: text("highlights", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  specs: text("specs", { mode: "json" })
    .$type<ProductSpec[]>()
    .notNull()
    .default([]),
  usageNote: text("usage_note"),
  stock: integer("stock").notNull().default(999),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  textureClass: text("texture_class").notNull().default("texture-default"),
  hasSizeGuide: integer("has_size_guide", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const productVariants = sqliteTable("product_variants", {
  id: id(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  grainSize: text("grain_size"),
  packSize: text("pack_size").notNull(),
  price: integer("price").notNull(),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const orders = sqliteTable("orders", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  status: text("status").notNull().default("pending").$type<OrderStatus>(),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  couponCode: text("coupon_code"),
  shippingAddress: text("shipping_address", { mode: "json" })
    .$type<ShippingAddress>()
    .notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  shiprocketShipmentId: text("shiprocket_shipment_id"),
  createdAt: createdAt(),
});

export const orderItems = sqliteTable("order_items", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(),
});

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("cart_items_user_variant_unique").on(table.userId, table.variantId)]
);

export const coupons = sqliteTable("coupons", {
  id: id(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().$type<CouponDiscountType>(),
  value: integer("value").notNull(),
  minOrderAmount: integer("min_order_amount").notNull().default(0),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: text("expires_at"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const volumeDiscounts = sqliteTable("volume_discounts", {
  id: id(),
  minOrderAmount: integer("min_order_amount").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  label: text("label"),
});

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    rating: integer("rating").notNull(),
    body: text("body"),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("reviews_product_user_order_unique").on(
      table.productId,
      table.userId,
      table.orderId
    ),
  ]
);

// --- Relations (enables db.query.x.findMany({ with: {...} })) ---

export const userRelations = relations(user, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(user, { fields: [addresses.userId], references: [user.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(user, { fields: [cartItems.userId], references: [user.id] }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));
