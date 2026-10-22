/** Checkout: delivery address, name/GSTIN, order summary, place order. */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearCart, readCart } from '@/lib/cart-client';
import { inr } from '@/lib/format';
import { fetchPrices, Totals, type Priced } from './CartView';

type Address = { id: string; label: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };
type Props = { addresses: Address[]; name: string; gstin: string; phone: string; states: readonly string[] };

const FIELDS = [
  ['name', 'Recipient name', 'name'],
  ['phone', 'Recipient mobile', 'tel'],
  ['line1', 'House / street', 'address-line1'],
  ['line2', 'Area / landmark (optional)', 'address-line2'],
  ['city', 'City', 'address-level2'],
  ['pincode', 'Pincode', 'postal-code'],
] as const;

export default function CheckoutForm({ addresses, name: initialName, gstin: initialGstin, phone, states }: Props) {
  const [priced, setPriced] = useState<Priced | null>(null);
  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? 'new');
  const [addr, setAddr] = useState<Record<string, string>>({ name: initialName, phone: phone.slice(2), state: 'Telangana' });
  const [name, setName] = useState(initialName);
  const [gstin, setGstin] = useState(initialGstin);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const lines = readCart();
    if (!lines.length) { window.location.replace('/cart'); return; }
    fetchPrices(lines).then(setPriced).catch(() => setError('Could not load prices. Refresh the page.'));
  }, []);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setErrors({});
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lines: readCart(),
        name,
        gstin,
        note,
        ...(addressId === 'new' ? { address: addr } : { addressId }),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, any>;
    setBusy(false);
    if (res.ok && data.id) {
      clearCart();
      window.location.assign(`/account/orders/${data.id}?placed=1`);
      return;
    }
    if (res.status === 401) { window.location.assign('/login?next=/checkout'); return; }
    setError(data.error || 'Something went wrong. Please try again.');
    if (data.fields) setErrors(data.fields);
    if (res.status === 409) fetchPrices(readCart()).then(setPriced);
  }

  const field = (key: string, label: string, auto: string) => (
    <div key={key} className={key === 'line1' || key === 'line2' ? 'sm:col-span-2' : ''}>
      <Label htmlFor={`a-${key}`} className="mb-1.5">{label}</Label>
      <Input id={`a-${key}`} autoComplete={auto} value={addr[key] ?? ''} onChange={(e) => setAddr({ ...addr, [key]: e.target.value })}
        required={key !== 'line2'} inputMode={key === 'pincode' || key === 'phone' ? 'numeric' : undefined} aria-invalid={!!errors[key]} className="h-11" />
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <fieldset className="rounded-xl border bg-card p-5">
          <legend className="px-1 font-heading text-xl text-heading">Delivery address</legend>
          <div className="space-y-3">
            {addresses.map((a) => (
              <label key={a.id} className="flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent">
                <input type="radio" name="address" value={a.id} checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[var(--primary)]" />
                <span className="text-sm">
                  <strong>{a.label}</strong> — {a.name}, {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}
                </span>
              </label>
            ))}
            {addresses.length > 0 && (
              <label className="flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent">
                <input type="radio" name="address" value="new" checked={addressId === 'new'} onChange={() => setAddressId('new')} className="mt-1 accent-[var(--primary)]" />
                <span className="text-sm font-medium">Deliver to a new address</span>
              </label>
            )}
          </div>
          {addressId === 'new' && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FIELDS.slice(0, 5).map(([k, l, a]) => field(k, l, a))}
              <div>
                <Label htmlFor="a-state" className="mb-1.5">State</Label>
                <select id="a-state" autoComplete="address-level1" value={addr.state ?? ''} onChange={(e) => setAddr({ ...addr, state: e.target.value })} required className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm">
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
              </div>
              {field(...FIELDS[5])}
            </div>
          )}
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
          <legend className="px-1 font-heading text-xl text-heading">Your details</legend>
          <div>
            <Label htmlFor="c-name" className="mb-1.5">Your name</Label>
            <Input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" aria-invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="c-gstin" className="mb-1.5">GSTIN (optional)</Label>
            <Input id="c-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} maxLength={15} placeholder="For a business invoice" className="h-11" aria-invalid={!!errors.gstin} />
            {errors.gstin && <p className="mt-1 text-xs text-destructive">{errors.gstin}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-note" className="mb-1.5">Note for us (optional)</Label>
            <textarea id="c-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="mb-4 text-xl">Order summary</h2>
        {priced ? (
          <>
            <ul className="mb-4 space-y-2 text-sm">
              {priced.lines.map((l) => (
                <li key={l.sku} className="flex justify-between gap-3">
                  <span>{l.qty} × {l.name} <span className="text-muted-foreground">({l.packSize})</span></span>
                  <span className="tabular-nums">{inr(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            {priced.problems.length > 0 && <p className="mb-3 text-sm text-destructive">Some items are unavailable — <a href="/cart" className="underline">review your cart</a>.</p>}
            <Totals p={priced} />
          </>
        ) : <p className="text-muted-foreground">Loading…</p>}
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-5 h-12 w-full text-base" disabled={busy || !priced?.lines.length || priced.problems.length > 0}>
          {busy ? 'Placing order…' : 'Place order'}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">No payment now. We'll confirm your order and send payment details on WhatsApp.</p>
      </aside>
    </form>
  );
}
