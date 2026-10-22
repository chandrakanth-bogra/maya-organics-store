/** Customer profile and saved addresses. Every query is scoped to the customer. */
import { and, asc, desc, eq } from 'drizzle-orm';
import type { Db } from './index';
import { addresses, customers } from './schema';
import { newId, normalizePhone } from './util';

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

export type AddressInput = { label?: string; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault?: boolean };

/** Validate an address from a form. Returns the clean value or field errors. */
export function cleanAddress(input: Record<string, unknown>): { ok: true; value: AddressInput } | { ok: false; errors: Record<string, string> } {
  const v = {
    label: str(input.label, 30) || 'Home',
    name: str(input.name, 80),
    phone: normalizePhone(str(input.phone, 20)) ?? '',
    line1: str(input.line1, 150),
    line2: str(input.line2, 150),
    city: str(input.city, 60),
    state: str(input.state, 60),
    pincode: str(input.pincode, 6),
    isDefault: input.isDefault === true || input.isDefault === 'on' || input.isDefault === 'true',
  };
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = 'Enter the recipient\'s name.';
  if (!v.phone) errors.phone = 'Enter a 10-digit Indian mobile number.';
  if (!v.line1) errors.line1 = 'Enter the house / street.';
  if (!v.city) errors.city = 'Enter the city.';
  if (!(INDIAN_STATES as readonly string[]).includes(v.state)) errors.state = 'Choose a state.';
  if (!/^[1-9]\d{5}$/.test(v.pincode)) errors.pincode = 'Enter a 6-digit pincode.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: v };
}

export function listAddresses(db: Db, customerId: string) {
  return db.query.addresses.findMany({
    where: eq(addresses.customerId, customerId),
    orderBy: [desc(addresses.isDefault), asc(addresses.createdAt)],
  });
}

export function getAddress(db: Db, customerId: string, id: string) {
  return db.query.addresses.findFirst({ where: and(eq(addresses.id, id), eq(addresses.customerId, customerId)) });
}

/** Add or update an address. The first address, or one marked default, becomes the default. */
export async function saveAddress(db: Db, customerId: string, value: AddressInput, id?: string) {
  const existing = await listAddresses(db, customerId);
  const makeDefault = value.isDefault || existing.length === 0 || (existing.length === 1 && existing[0].id === id);
  const row = { ...value, line2: value.line2 || null, isDefault: makeDefault };
  if (makeDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.customerId, customerId));
  if (id && existing.some((a) => a.id === id)) {
    await db.update(addresses).set(row).where(and(eq(addresses.id, id), eq(addresses.customerId, customerId)));
    return id;
  }
  const newIdValue = newId();
  await db.insert(addresses).values({ id: newIdValue, customerId, ...row });
  return newIdValue;
}

export async function deleteAddress(db: Db, customerId: string, id: string) {
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.customerId, customerId)));
  // Keep one default if any are left.
  const left = await listAddresses(db, customerId);
  if (left.length && !left.some((a) => a.isDefault)) await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, left[0].id));
}

export function cleanProfile(input: Record<string, unknown>): { ok: true; value: { name: string; email: string | null; gstin: string | null } } | { ok: false; errors: Record<string, string> } {
  const name = str(input.name, 80);
  const email = str(input.email, 120).toLowerCase();
  const gstin = str(input.gstin, 15).toUpperCase();
  const errors: Record<string, string> = {};
  if (!name) errors.name = 'Enter your name.';
  if (email && !EMAIL.test(email)) errors.email = 'Enter a valid email or leave it blank.';
  if (gstin && !GSTIN.test(gstin)) errors.gstin = 'That GSTIN doesn\'t look right (15 characters, e.g. 36ABCDE1234F1Z5).';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { name, email: email || null, gstin: gstin || null } };
}

export const updateProfile = (db: Db, customerId: string, value: { name: string; email: string | null; gstin: string | null }) =>
  db.update(customers).set(value).where(eq(customers.id, customerId));
