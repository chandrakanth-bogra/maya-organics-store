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

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, { fields: [variants.productSlug], references: [products.slug] }),
}));

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type ProductWithVariants = Product & { variants: Variant[] };
