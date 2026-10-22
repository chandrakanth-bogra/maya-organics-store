/**
 * POST /api/orders — place an order (logged-in customers).
 * Body: { lines: [{sku, qty}], addressId? | address?, name?, gstin?, note? }
 * Prices are worked out here from the catalogue. The order starts as
 * "pending_payment"; the WhatsApp bot tells the team, who confirm it and send
 * payment details.
 */
import type { APIRoute } from 'astro';
import {
  cleanAddress, cleanCart, cleanProfile, createOrder, getAddress, priceCart, saveAddress, updateProfile, type OrderAddress,
} from '@maya/db';
import { db, json } from '../../lib/session';
import { POLICY } from '../../lib/site';
import { notifyNewOrder } from '../../lib/bot';

export const POST: APIRoute = async ({ request, locals }) => {
  const customer = locals.customer;
  if (!customer) return json({ error: 'Please log in again.' }, 401);

  const body = (await request.json().catch(() => ({}))) as Record<string, any>;
  const d = db();

  // Name and GSTIN (saved to the profile the first time).
  const profile = cleanProfile({ name: body.name ?? customer.name ?? '', email: customer.email ?? '', gstin: body.gstin ?? '' });
  if (!profile.ok) return json({ error: Object.values(profile.errors)[0], fields: profile.errors }, 400);
  if (profile.value.name !== customer.name || (profile.value.gstin && profile.value.gstin !== customer.gstin)) {
    await updateProfile(d, customer.id, { name: profile.value.name, email: customer.email, gstin: profile.value.gstin ?? customer.gstin });
  }

  // Delivery address: a saved one, or a new one (saved for next time).
  let address: OrderAddress;
  if (typeof body.addressId === 'string' && body.addressId) {
    const a = await getAddress(d, customer.id, body.addressId);
    if (!a) return json({ error: 'Choose a delivery address.' }, 400);
    address = { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode };
  } else {
    const a = cleanAddress(body.address ?? {});
    if (!a.ok) return json({ error: 'Check the delivery address.', fields: a.errors }, 400);
    await saveAddress(d, customer.id, a.value);
    address = { name: a.value.name, phone: a.value.phone, line1: a.value.line1, line2: a.value.line2 || null, city: a.value.city, state: a.value.state, pincode: a.value.pincode };
  }

  const priced = await priceCart(d, cleanCart(body.lines), { freeDeliveryAbove: POLICY.freeDeliveryAbove, deliveryFee: POLICY.deliveryFee });
  if (priced.problems.length) return json({ error: 'Some items changed. Please review your cart.', problems: priced.problems }, 409);
  if (!priced.lines.length) return json({ error: 'Your cart is empty.' }, 400);

  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;
  const id = await createOrder(d, { customerId: customer.id, priced, address, gstin: profile.value.gstin, note });

  // Tell the team on WhatsApp after responding (never blocks or fails the order).
  locals.cfContext.waitUntil(notifyNewOrder(id));
  return json({ id });
};
