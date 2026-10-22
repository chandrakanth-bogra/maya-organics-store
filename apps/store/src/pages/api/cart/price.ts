/** POST /api/cart/price { lines: [{ sku, qty }] } → server-side prices, delivery and problems. */
import type { APIRoute } from 'astro';
import { cleanCart, priceCart } from '@maya/db';
import { db, json } from '../../../lib/session';
import { POLICY } from '../../../lib/site';

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as { lines?: unknown };
  const priced = await priceCart(db(), cleanCart(body.lines), { freeDeliveryAbove: POLICY.freeDeliveryAbove, deliveryFee: POLICY.deliveryFee });
  return json({ ...priced, freeDeliveryAbove: POLICY.freeDeliveryAbove });
};
