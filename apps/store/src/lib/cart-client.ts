/**
 * The cart lives in the browser (localStorage) as SKUs and quantities only.
 * Prices are always worked out by the server (/api/cart/price, /api/orders).
 */
export type CartLine = { sku: string; qty: number };

const KEY = 'mo_cart';
export const CART_EVENT = 'mo-cart';
const MAX_QTY = 99;

export function readCart(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((l) => typeof l?.sku === 'string' && Number.isInteger(l?.qty) && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: lines }));
}

export function addToCart(sku: string, qty = 1) {
  const lines = readCart();
  const hit = lines.find((l) => l.sku === sku);
  if (hit) hit.qty = Math.min(MAX_QTY, hit.qty + qty);
  else lines.push({ sku, qty: Math.min(MAX_QTY, qty) });
  write(lines);
}

export function setQty(sku: string, qty: number) {
  write(readCart().map((l) => (l.sku === sku ? { ...l, qty: Math.min(MAX_QTY, Math.max(0, qty)) } : l)).filter((l) => l.qty > 0));
}

export const removeFromCart = (sku: string) => setQty(sku, 0);
export const clearCart = () => write([]);
export const cartCount = () => readCart().reduce((n, l) => n + l.qty, 0);
