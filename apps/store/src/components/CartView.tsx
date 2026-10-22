/** Cart page: lines from localStorage, prices and stock from the server. */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { addToCart, CART_EVENT, readCart, removeFromCart, setQty, type CartLine } from '@/lib/cart-client';
import { inr } from '@/lib/format';

export type Priced = {
  lines: { sku: string; productSlug: string; name: string; packSize: string; grainSize: string | null; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number | null;
  total: number;
  problems: { sku: string; reason: 'unknown' | 'out_of_stock' }[];
  freeDeliveryAbove: number;
};

export async function fetchPrices(lines: CartLine[]): Promise<Priced> {
  const res = await fetch('/api/cart/price', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lines }) });
  if (!res.ok) throw new Error('price');
  return res.json();
}

export function Totals({ p }: { p: Priced }) {
  const toFree = p.freeDeliveryAbove - p.subtotal;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal (incl. GST)</dt><dd>{inr(p.subtotal)}</dd></div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Delivery</dt>
        <dd>{p.deliveryFee === 0 ? 'Free' : p.deliveryFee == null ? 'Confirmed on WhatsApp' : inr(p.deliveryFee)}</dd>
      </div>
      {toFree >= 0 && p.subtotal > 0 && (
        <p className="rounded-md bg-accent px-3 py-2 text-accent-foreground">Free delivery on orders above {inr(p.freeDeliveryAbove)} — {inr(toFree)} to go.</p>
      )}
      <div className="flex justify-between border-t pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd>{inr(p.total)}{p.deliveryFee == null && <span className="font-normal text-muted-foreground"> + delivery</span>}</dd>
      </div>
    </dl>
  );
}

export default function CartView() {
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [priced, setPriced] = useState<Priced | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // No-JavaScript fallback from product pages: /cart?add=SKU&qty=N
    const q = new URLSearchParams(location.search);
    if (q.get('add')) {
      addToCart(q.get('add')!, Math.max(1, Number(q.get('qty')) || 1));
      history.replaceState(null, '', '/cart');
    }
    const update = () => setLines(readCart());
    update();
    window.addEventListener(CART_EVENT, update);
    return () => window.removeEventListener(CART_EVENT, update);
  }, []);

  useEffect(() => {
    if (!lines) return;
    if (!lines.length) { setPriced(null); return; }
    let live = true;
    fetchPrices(lines).then((p) => live && (setPriced(p), setError(''))).catch(() => live && setError('Could not load prices. Check your connection and refresh.'));
    return () => { live = false; };
  }, [lines]);

  if (lines === null) return <p className="text-muted-foreground">Loading your cart…</p>;
  if (!lines.length) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-lg">Your cart is empty.</p>
        <Button asChild className="mt-4 h-11 px-6"><a href="/products">Shop products</a></Button>
      </div>
    );
  }

  const problemFor = (sku: string) => priced?.problems.find((p) => p.sku === sku);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y rounded-xl border bg-card">
        {priced?.lines.map((l) => (
          <li key={l.sku} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <a href={`/products/${l.productSlug}`} className="font-medium hover:underline">{l.name}</a>
              <p className="text-sm text-muted-foreground">{[l.grainSize, l.packSize].filter(Boolean).join(' · ')} · {inr(l.unitPrice)} each</p>
            </div>
            <div className="flex items-center rounded-lg border" role="group" aria-label={`Quantity of ${l.name}`}>
              <button type="button" className="size-9 text-lg" aria-label="One less" onClick={() => setQty(l.sku, l.qty - 1)}>−</button>
              <span className="w-8 text-center tabular-nums" aria-live="polite">{l.qty}</span>
              <button type="button" className="size-9 text-lg" aria-label="One more" onClick={() => setQty(l.sku, l.qty + 1)}>+</button>
            </div>
            <p className="w-20 text-right font-semibold tabular-nums">{inr(l.lineTotal)}</p>
            <button type="button" className="text-sm text-muted-foreground underline underline-offset-2 hover:text-destructive" onClick={() => removeFromCart(l.sku)}>Remove</button>
          </li>
        ))}
        {lines.filter((l) => problemFor(l.sku)).map((l) => (
          <li key={l.sku} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span className="text-destructive">{problemFor(l.sku)!.reason === 'out_of_stock' ? `${l.sku} is out of stock right now.` : `${l.sku} is no longer sold.`}</span>
            <button type="button" className="underline underline-offset-2" onClick={() => removeFromCart(l.sku)}>Remove</button>
          </li>
        ))}
        {!priced && !error && <li className="p-4 text-muted-foreground">Checking prices…</li>}
      </ul>

      <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
        {priced && <Totals p={priced} />}
        <Button asChild className="mt-5 h-12 w-full text-base" disabled={!priced?.lines.length}>
          <a href="/checkout" aria-disabled={!priced?.lines.length}>Checkout</a>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">You'll log in with your WhatsApp number. We confirm the order and share payment details on WhatsApp.</p>
      </aside>
    </div>
  );
}
