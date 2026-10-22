/**
 * Cart pricing and order creation. Prices always come from the catalogue on
 * the server; the browser only sends SKUs and quantities.
 */
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from './index';
import { orderItems, orders, products, variants, type OrderAddress } from './schema';
import { randomString, READABLE } from './util';

export const MAX_QTY = 99;
export const MAX_LINES = 30;

export type CartLine = { sku: string; qty: number };

export type PricedLine = {
  sku: string;
  productSlug: string;
  name: string;
  packSize: string;
  grainSize: string | null;
  qty: number;
  unitPrice: number; // paise
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  /** null: below the free-delivery threshold and no fee set — the team confirms it. */
  deliveryFee: number | null;
  total: number;
  problems: { sku: string; reason: 'unknown' | 'out_of_stock' }[];
};

/** Merge duplicate SKUs, clamp quantities, drop junk. */
export function cleanCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const merged = new Map<string, number>();
  for (const l of input.slice(0, MAX_LINES * 2)) {
    const sku = typeof l?.sku === 'string' ? l.sku.trim().slice(0, 64) : '';
    const qty = Math.floor(Number(l?.qty));
    if (!sku || !Number.isFinite(qty) || qty < 1) continue;
    merged.set(sku, Math.min(MAX_QTY, (merged.get(sku) ?? 0) + qty));
  }
  return [...merged].slice(0, MAX_LINES).map(([sku, qty]) => ({ sku, qty }));
}

export async function priceCart(
  db: Db,
  cart: CartLine[],
  { freeDeliveryAbove, deliveryFee }: { freeDeliveryAbove: number; deliveryFee: number | null }
): Promise<PricedCart> {
  const skus = cart.map((l) => l.sku);
  const rows = skus.length
    ? await db
        .select({ v: variants, name: products.name })
        .from(variants)
        .innerJoin(products, eq(products.slug, variants.productSlug))
        .where(and(inArray(variants.sku, skus), eq(variants.active, true), eq(products.active, true)))
    : [];
  const bySku = new Map(rows.map((r) => [r.v.sku, r]));

  const lines: PricedLine[] = [];
  const problems: PricedCart['problems'] = [];
  for (const { sku, qty } of cart) {
    const r = bySku.get(sku);
    if (!r) { problems.push({ sku, reason: 'unknown' }); continue; }
    if (!r.v.inStock) { problems.push({ sku, reason: 'out_of_stock' }); continue; }
    lines.push({
      sku,
      productSlug: r.v.productSlug,
      name: r.name,
      packSize: r.v.packSize,
      grainSize: r.v.grainSize,
      qty,
      unitPrice: r.v.price,
      lineTotal: r.v.price * qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const fee = subtotal === 0 || subtotal > freeDeliveryAbove ? 0 : deliveryFee;
  return { lines, subtotal, deliveryFee: fee, total: subtotal + (fee ?? 0), problems };
}

export const newOrderId = () => `MO-${randomString(6, READABLE)}`;

/** Save an order and its lines in one batch (D1 has no interactive transactions). */
export async function createOrder(
  db: Db,
  { customerId, priced, address, gstin, note, source = 'web', now = new Date() }:
  { customerId: string; priced: PricedCart; address: OrderAddress; gstin?: string | null; note?: string | null; source?: 'web' | 'agent'; now?: Date }
) {
  if (!priced.lines.length) throw new Error('empty order');
  const id = newOrderId();
  const iso = now.toISOString();
  await db.batch([
    db.insert(orders).values({
      id,
      customerId,
      status: 'pending_payment',
      subtotal: priced.subtotal,
      deliveryFee: priced.deliveryFee,
      total: priced.total,
      gstin: gstin || null,
      address,
      note: note || null,
      source,
      createdAt: iso,
      updatedAt: iso,
    }),
    db.insert(orderItems).values(
      priced.lines.map((l) => ({
        orderId: id,
        sku: l.sku,
        productSlug: l.productSlug,
        name: l.name,
        packSize: l.packSize,
        grainSize: l.grainSize,
        quantity: l.qty,
        unitPrice: l.unitPrice,
      }))
    ),
  ]);
  return id;
}

export function listOrders(db: Db, customerId: string, limit = 50) {
  return db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    orderBy: [desc(orders.createdAt)],
    limit,
    with: { items: true },
  });
}

export function getOrder(db: Db, customerId: string, id: string) {
  return db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.customerId, customerId)), with: { items: true } });
}
