import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeD1 } from './fake-d1';
import {
  normalizePhone, startLogin, loginStatus, confirmWhatsappLogin, completeLogin, customerForSession, endSession,
  verifyCode, recentRequestCount, whatsappLoginText, WHATSAPP_LOGIN_PATTERN, MAX_CODE_ATTEMPTS,
  cleanCart, priceCart, createOrder, listOrders, getOrder, cleanAddress, saveAddress, listAddresses, deleteAddress, cleanProfile,
  type Db,
} from '../src/index';

const POLICY = { freeDeliveryAbove: 100000, deliveryFee: null };
const PHONE = '919876543210';
const OTHER = '919000000001';

async function loggedIn(db: Db, phone = PHONE) {
  const r = await startLogin(db, { phone, method: 'whatsapp' });
  await confirmWhatsappLogin(db, r.code, phone);
  const st = await loginStatus(db, r.browserSecret);
  assert.equal(st.status, 'verified');
  if (st.status !== 'verified') throw new Error('not verified');
  return (await completeLogin(db, { requestId: st.requestId, phone }))!;
}

test('phone numbers: Indian mobiles only, normalised to 91XXXXXXXXXX', () => {
  for (const p of ['9876543210', '+91 98765 43210', '09876543210', '91-98765-43210']) assert.equal(normalizePhone(p), PHONE);
  for (const p of ['12345', '5876543210', '+1 415 555 0100', '']) assert.equal(normalizePhone(p), null);
});

test('WhatsApp login: only the number that started it can confirm; then one session', async () => {
  const { db } = fakeD1();
  const { code, browserSecret } = await startLogin(db, { phone: PHONE, method: 'whatsapp' });
  assert.equal(whatsappLoginText(code).match(WHATSAPP_LOGIN_PATTERN)?.[1], code);

  assert.deepEqual(await loginStatus(db, browserSecret), { status: 'pending' });
  assert.equal(await confirmWhatsappLogin(db, code, OTHER), 'wrong_number');
  assert.equal(await confirmWhatsappLogin(db, 'ZZZZZZ', PHONE), 'not_found');
  assert.equal(await confirmWhatsappLogin(db, code.toLowerCase(), PHONE), 'ok', 'case-insensitive');

  const st = await loginStatus(db, browserSecret);
  assert.equal(st.status, 'verified');
  if (st.status !== 'verified') return;
  const s = await completeLogin(db, { requestId: st.requestId, phone: st.phone });
  assert.ok(s && s.token.length >= 40);
  assert.equal((await customerForSession(db, s.token))?.phone, PHONE);
  assert.equal(await completeLogin(db, { requestId: st.requestId, phone: st.phone }), null, 'a login is used once');
  assert.deepEqual(await loginStatus(db, browserSecret), { status: 'expired' });

  await endSession(db, s.token);
  assert.equal(await customerForSession(db, s.token), null);
  assert.equal(await customerForSession(db, 'not-a-token'), null);
});

test('logins expire after 10 minutes; the same phone gets the same customer', async () => {
  const { db } = fakeD1();
  const t0 = new Date(Date.now() - 20 * 60_000);
  const later = new Date(t0.getTime() + 11 * 60_000);
  const a = await startLogin(db, { phone: PHONE, method: 'whatsapp', now: t0 });
  assert.equal(await confirmWhatsappLogin(db, a.code, PHONE, later), 'not_found');
  assert.deepEqual(await loginStatus(db, a.browserSecret, later), { status: 'expired' });

  const first = await loggedIn(db);
  const second = await loggedIn(db);
  assert.equal(first.customer.id, second.customer.id);
  assert.equal(await recentRequestCount(db, PHONE), 3);
});

test('typed codes: right code logs in, wrong codes are limited', async () => {
  const { db } = fakeD1();
  const r = await startLogin(db, { phone: PHONE, method: 'sms' });
  assert.match(r.code, /^\d{6}$/);
  const notIt = (c: string) => (c === '123456' ? '654321' : '123456');
  assert.deepEqual(await verifyCode(db, r.browserSecret, notIt(r.code)), { ok: false, error: 'wrong_code' });
  assert.equal((await verifyCode(db, r.browserSecret, r.code)).ok, true);

  const r2 = await startLogin(db, { phone: PHONE, method: 'whatsapp_code' });
  let last;
  for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) last = await verifyCode(db, r2.browserSecret, notIt(r2.code));
  assert.deepEqual(last, { ok: false, error: 'too_many_attempts' });
  assert.deepEqual(await verifyCode(db, r2.browserSecret, r2.code), { ok: false, error: 'too_many_attempts' }, 'even the right code after too many tries');
  assert.deepEqual(await verifyCode(db, 'wrong-browser', r2.code), { ok: false, error: 'expired' });

  const wa = await startLogin(db, { phone: PHONE, method: 'whatsapp' });
  assert.deepEqual(await verifyCode(db, wa.browserSecret, wa.code), { ok: false, error: 'expired' }, 'WhatsApp codes cannot be typed in');
});

test('cart: prices from the catalogue, free delivery only above ₹1,000, problems reported', async () => {
  const { db, sqlite } = fakeD1();
  assert.deepEqual(
    cleanCart([{ sku: 'A', qty: 2 }, { sku: 'A', qty: 1 }, { sku: '', qty: 1 }, { sku: 'B', qty: -1 }, { sku: 'C', qty: 500 }]),
    [{ sku: 'A', qty: 3 }, { sku: 'C', qty: 99 }]
  );
  assert.deepEqual(cleanCart('nope'), []);

  let p = await priceCart(db, [{ sku: 'PERLITE-330G', qty: 2 }], POLICY);
  assert.deepEqual([p.subtotal, p.deliveryFee, p.total], [40000, null, 40000]);
  assert.equal(p.lines[0].name, 'Perlite');

  p = await priceCart(db, [{ sku: 'PERLITE-330G', qty: 5 }], POLICY); // exactly ₹1,000 is not above
  assert.equal(p.deliveryFee, null);
  p = await priceCart(db, [{ sku: 'PINE-BARK-1KG', qty: 3 }], POLICY); // ₹1,050
  assert.deepEqual([p.subtotal, p.deliveryFee, p.total], [105000, 0, 105000]);
  p = await priceCart(db, [{ sku: 'PERLITE-330G', qty: 1 }], { freeDeliveryAbove: 100000, deliveryFee: 8000 });
  assert.deepEqual([p.deliveryFee, p.total], [8000, 28000]);

  sqlite.exec("UPDATE variants SET in_stock = 0 WHERE sku = 'NEEM-CAKE-1KG'");
  p = await priceCart(db, [{ sku: 'NEEM-CAKE-1KG', qty: 1 }, { sku: 'FAKE', qty: 1 }, { sku: 'ZEOLITE-1KG', qty: 1 }], POLICY);
  assert.deepEqual(p.problems, [{ sku: 'NEEM-CAKE-1KG', reason: 'out_of_stock' }, { sku: 'FAKE', reason: 'unknown' }]);
  assert.deepEqual(p.lines.map((l) => l.sku), ['ZEOLITE-1KG']);
});

test('orders: saved with a snapshot of prices, only visible to their customer', async () => {
  const { db, sqlite } = fakeD1();
  const { customer } = await loggedIn(db);

  const priced = await priceCart(db, [{ sku: 'PUMICE-1KG', qty: 2 }, { sku: 'LECA-5L', qty: 1 }], POLICY);
  const address = { name: 'Ravi', phone: PHONE, line1: '1-2-3 MG Road', city: 'Hyderabad', state: 'Telangana', pincode: '500001' };
  const id = await createOrder(db, { customerId: customer.id, priced, address });
  assert.match(id, /^MO-[2-9A-HJKMNP-Z]{6}$/);

  sqlite.exec("UPDATE variants SET price = 99900 WHERE sku = 'PUMICE-1KG'"); // a later price change
  const o = await getOrder(db, customer.id, id);
  assert.equal(o?.status, 'pending_payment');
  assert.equal(o?.total, 75000);
  assert.deepEqual(o?.items.map((i) => [i.sku, i.quantity, i.unitPrice]), [['PUMICE-1KG', 2, 25000], ['LECA-5L', 1, 25000]]);
  assert.equal(o?.address.city, 'Hyderabad');
  assert.equal((await listOrders(db, customer.id)).length, 1);
  assert.equal(await getOrder(db, 'someone-else', id), undefined);
  await assert.rejects(createOrder(db, { customerId: customer.id, priced: { ...priced, lines: [] }, address }), /empty/);
});

test('addresses and profile: validated, one default, scoped to the customer', async () => {
  const { db } = fakeD1();
  const { customer } = await loggedIn(db);

  const bad = cleanAddress({ name: '', phone: '123', line1: '', city: '', state: 'Narnia', pincode: '0123' });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.deepEqual(Object.keys(bad.errors).sort(), ['city', 'line1', 'name', 'phone', 'pincode', 'state']);

  const good = cleanAddress({ name: ' Ravi  Kumar ', phone: '98765 43210', line1: 'Plot 4', city: 'Hyderabad', state: 'Telangana', pincode: '500081' });
  assert.equal(good.ok, true);
  if (!good.ok) return;
  assert.equal(good.value.name, 'Ravi Kumar');
  const a1 = await saveAddress(db, customer.id, good.value);
  const a2 = await saveAddress(db, customer.id, { ...good.value, label: 'Office', isDefault: true });
  let list = await listAddresses(db, customer.id);
  assert.deepEqual(list.map((a) => [a.id, a.isDefault]), [[a2, true], [a1, false]]);
  await deleteAddress(db, customer.id, a2);
  list = await listAddresses(db, customer.id);
  assert.deepEqual(list.map((a) => [a.id, a.isDefault]), [[a1, true]]);
  await deleteAddress(db, 'someone-else', a1);
  assert.equal((await listAddresses(db, customer.id)).length, 1);

  assert.equal(cleanProfile({ name: 'Ravi', gstin: '36ABCDE1234F1Z5' }).ok, true);
  assert.equal(cleanProfile({ name: 'Ravi', gstin: 'nope' }).ok, false);
  assert.equal(cleanProfile({ name: '', email: 'x' }).ok, false);
});
