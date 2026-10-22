/**
 * Shared D1 schema (database `maya-organics-db`).
 *
 * The catalogue here is the single source of truth for products, sizes,
 * prices and stock. The store, the admin app and the WhatsApp bot all read
 * and write it. Money is stored in paise (₹1 = 100). Retail prices include GST.
 */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

const nowIso = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export const products = sqliteTable('products', {
  slug: text('slug').primaryKey(), // URL key, e.g. "pine-bark"
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g. "Volcanic Mineral"
  summary: text('summary').notNull(), // one line for cards and lists
  image: text('image').notNull(), // file name under /images
  hsn: text('hsn'),
  gstRate: integer('gst_rate'), // percent, e.g. 5 or 18
  sortOrder: integer('sort_order').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  updatedAt: text('updated_at').notNull().default(nowIso),
  updatedBy: text('updated_by'),
});

/** A sellable size of a product (grain size × pack size). */
export const variants = sqliteTable(
  'variants',
  {
    sku: text('sku').primaryKey(), // e.g. "PUMICE-1KG", "PUMICE-4-6MM-1KG"
    productSlug: text('product_slug')
      .notNull()
      .references(() => products.slug, { onDelete: 'cascade', onUpdate: 'cascade' }),
    grainSize: text('grain_size'), // null when the product has one grade
    packSize: text('pack_size').notNull(), // label shown to customers, e.g. "1.3kg (5L)"
    weightGrams: integer('weight_grams'), // for shipping
    price: integer('price').notNull(), // paise, GST included
    mrp: integer('mrp'), // paise; shown struck through when above price
    stock: integer('stock'), // units on hand; null = not counted
    inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    amazonSkus: text('amazon_skus'), // comma separated
    catalogueIds: text('catalogue_ids'), // WhatsApp catalogue Content IDs, comma separated
    zohoItemId: text('zoho_item_id'),
    updatedAt: text('updated_at').notNull().default(nowIso),
    updatedBy: text('updated_by'),
  },
  (t) => [index('variants_product').on(t.productSlug, t.sortOrder)]
);

/** Audit trail for price and stock changes (store admin, WhatsApp bot). */
export const priceChanges = sqliteTable(
  'price_changes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sku: text('sku').notNull(),
    field: text('field').notNull(), // "price" | "in_stock" | "stock" | "mrp"
    oldValue: text('old_value'),
    newValue: text('new_value'),
    changedBy: text('changed_by').notNull(), // e.g. "whatsapp:918885453799", "admin:info@…"
    changedAt: text('changed_at').notNull().default(nowIso),
  },
  (t) => [index('price_changes_sku').on(t.sku, t.changedAt)]
);

// ---------------------------------------------------------------- customers and login

/** A customer is a phone number (Indian mobile, digits only: "919876543210"). */
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull().unique(),
  name: text('name'),
  email: text('email'),
  gstin: text('gstin'), // for B2B invoices
  createdAt: text('created_at').notNull().default(nowIso),
  lastLoginAt: text('last_login_at'),
});

export const addresses = sqliteTable(
  'addresses',
  {
    id: text('id').primaryKey(),
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    label: text('label').notNull().default('Home'),
    name: text('name').notNull(), // recipient
    phone: text('phone').notNull(), // recipient's phone for the courier
    line1: text('line1').notNull(),
    line2: text('line2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    pincode: text('pincode').notNull(),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull().default(nowIso),
  },
  (t) => [index('addresses_customer').on(t.customerId)]
);

/** Logged-in browsers. The cookie holds a random token; only its SHA-256 is stored here. */
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(), // sha256(token), hex
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().default(nowIso),
    expiresAt: text('expires_at').notNull(),
    userAgent: text('user_agent'),
  },
  (t) => [index('sessions_customer').on(t.customerId)]
);

/**
 * One login attempt for a phone number.
 * method "whatsapp": the customer sends the code to our WhatsApp from that number; the bot
 *   sets verified_at. method "whatsapp_code" / "sms": we send a 6-digit code they type in.
 * code_hash and browser_hash are SHA-256 hex; the browser holds its secret in a cookie.
 */
export const loginRequests = sqliteTable(
  'login_requests',
  {
    id: text('id').primaryKey(),
    phone: text('phone').notNull(),
    method: text('method').notNull().$type<'whatsapp' | 'whatsapp_code' | 'sms'>(),
    codeHash: text('code_hash').notNull(),
    browserHash: text('browser_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    createdAt: text('created_at').notNull().default(nowIso),
    expiresAt: text('expires_at').notNull(),
    verifiedAt: text('verified_at'),
    usedAt: text('used_at'),
    ip: text('ip'),
  },
  (t) => [index('login_requests_code').on(t.codeHash), index('login_requests_phone').on(t.phone, t.createdAt)]
);

// ---------------------------------------------------------------- orders

export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type OrderAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(), // order number shown to customers, e.g. "MO-7K3Q9X"
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.id),
    status: text('status').notNull().default('pending_payment').$type<OrderStatus>(),
    subtotal: integer('subtotal').notNull(), // paise, GST included
    deliveryFee: integer('delivery_fee'), // paise; null = to be confirmed by the team
    total: integer('total').notNull(), // subtotal + delivery (when known)
    gstin: text('gstin'),
    address: text('address', { mode: 'json' }).$type<OrderAddress>().notNull(),
    note: text('note'),
    source: text('source').notNull().default('web'), // "web" | "agent"
    createdAt: text('created_at').notNull().default(nowIso),
    updatedAt: text('updated_at').notNull().default(nowIso),
    teamNotifiedAt: text('team_notified_at'),
  },
  (t) => [index('orders_customer').on(t.customerId, t.createdAt)]
);

/** Snapshot of what was bought, at the price paid (catalogue rows can change later). */
export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    productSlug: text('product_slug').notNull(),
    name: text('name').notNull(),
    packSize: text('pack_size').notNull(),
    grainSize: text('grain_size'),
    quantity: integer('quantity').notNull(),
    unitPrice: integer('unit_price').notNull(), // paise
  },
  (t) => [index('order_items_order').on(t.orderId)]
);

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, { fields: [variants.productSlug], references: [products.slug] }),
}));

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type ProductWithVariants = Product & { variants: Variant[] };
export type Customer = typeof customers.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
