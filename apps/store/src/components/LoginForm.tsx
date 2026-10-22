/**
 * Phone login. Default: "Continue with WhatsApp" — the customer sends a short
 * code to our WhatsApp from their number, and this page logs in by itself.
 * Optional: a 6-digit code by WhatsApp or SMS (when switched on).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Channel = 'whatsapp_code' | 'sms';
type Props = { siteKey: string; channels: Channel[]; next: string };
type Step =
  | { name: 'phone' }
  | { name: 'whatsapp'; code: string; link: string; text: string }
  | { name: 'code'; channel: Channel };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const CHANNEL_LABEL: Record<Channel, string> = { whatsapp_code: 'Get a code on WhatsApp', sms: 'Get a code by SMS' };

async function api(path: string, body?: unknown) {
  const res = await fetch(path, body === undefined ? { cache: 'no-store' } : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data } as { ok: boolean; data: Record<string, any> };
}

export default function LoginForm({ siteKey, channels, next }: Props) {
  const [step, setStep] = useState<Step>({ name: 'phone' });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  // Turnstile (bot check) on the phone step.
  useEffect(() => {
    if (step.name !== 'phone') return;
    let cancelled = false;
    const mount = () => {
      if (cancelled || !widgetRef.current || !window.turnstile) return;
      widgetRef.current.innerHTML = '';
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
        appearance: 'interaction-only',
      });
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = mount;
      document.head.appendChild(s);
    }
    return () => { cancelled = true; };
  }, [step.name, siteKey]);

  const done = useCallback((needsName: boolean) => {
    window.location.assign(needsName ? `/account?welcome=1&next=${encodeURIComponent(next)}` : next);
  }, [next]);

  // While waiting for the WhatsApp message, check every 2 seconds.
  useEffect(() => {
    if (step.name !== 'whatsapp') return;
    let stop = false;
    const tick = async () => {
      if (stop) return;
      const { data } = await api('/api/auth/status');
      if (stop) return;
      if (data.status === 'done') return done(Boolean(data.needsName));
      if (data.status === 'expired') { setError('That login expired. Please start again.'); setStep({ name: 'phone' }); return; }
      setTimeout(tick, 2000);
    };
    const t = setTimeout(tick, 2000);
    return () => { stop = true; clearTimeout(t); };
  }, [step, done]);

  async function start(method: 'whatsapp' | Channel) {
    setError('');
    if (!/^\s*(\+?91[\s-]*)?0?[6-9](?:[\s-]*\d){9}\s*$/.test(phone)) { setError('Enter a 10-digit Indian mobile number.'); return; }
    if (!token) { setError('Please wait a moment for the security check, then try again.'); return; }
    setBusy(true);
    const { ok, data } = await api('/api/auth/start', { phone, method, turnstile: token });
    setBusy(false);
    setToken('');
    window.turnstile?.reset(widgetId.current);
    if (!ok) { setError(data.error || 'Something went wrong. Please try again.'); return; }
    if (method === 'whatsapp') setStep({ name: 'whatsapp', code: data.code, link: data.link, text: data.text });
    else setStep({ name: 'code', channel: method });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { ok, data } = await api('/api/auth/verify', { code });
    setBusy(false);
    if (ok) return done(Boolean(data.needsName));
    setError(data.error || 'That did not work.');
    if (data.expired) setStep({ name: 'phone' });
  }

  const err = error && <p role="alert" className="text-sm text-destructive">{error}</p>;

  if (step.name === 'whatsapp') {
    return (
      <div className="space-y-5">
        <p className="text-muted-foreground">Send this message to us on WhatsApp <strong className="text-foreground">from {phone}</strong>:</p>
        <p className="rounded-xl border bg-secondary px-4 py-5 text-center font-mono text-3xl tracking-[0.3em] text-foreground" aria-label={`Code ${step.code.split('').join(' ')}`}>{step.code}</p>
        <Button asChild size="lg" className="h-12 w-full bg-whatsapp text-base font-semibold text-[#0b2614] hover:bg-whatsapp/90">
          <a href={step.link} target="_blank" rel="noopener">Open WhatsApp and send</a>
        </Button>
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <span className="inline-block size-2 animate-pulse rounded-full bg-whatsapp" aria-hidden="true" />
          Waiting for your message — this page logs you in by itself.
        </p>
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer">WhatsApp did not open?</summary>
          <p className="mt-2">Send <strong className="text-foreground">{step.text}</strong> to <strong className="text-foreground">+91 76809 45577</strong> from {phone}.</p>
        </details>
        {err}
        <button type="button" className="text-sm text-heading underline underline-offset-2" onClick={() => { setError(''); setStep({ name: 'phone' }); }}>Use a different number</button>
      </div>
    );
  }

  if (step.name === 'code') {
    return (
      <form onSubmit={verify} className="space-y-5">
        <p className="text-muted-foreground">We sent a 6-digit code {step.channel === 'sms' ? 'by SMS' : 'on WhatsApp'} to <strong className="text-foreground">{phone}</strong>.</p>
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="h-12 text-center font-mono text-2xl tracking-[0.4em]" autoFocus required />
        </div>
        {err}
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Log in'}</Button>
        <button type="button" className="text-sm text-heading underline underline-offset-2" onClick={() => { setError(''); setCode(''); setStep({ name: 'phone' }); }}>Start again</button>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); start('whatsapp'); }} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile number</Label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+91</span>
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-l-none text-base" required autoFocus />
        </div>
        <p className="text-xs text-muted-foreground">New here? Logging in creates your account.</p>
      </div>
      <div ref={widgetRef} />
      {err}
      <Button type="submit" size="lg" className="h-12 w-full bg-whatsapp text-base font-semibold text-[#0b2614] hover:bg-whatsapp/90" disabled={busy}>
        {busy ? 'Please wait…' : 'Continue with WhatsApp'}
      </Button>
      {channels.map((c) => (
        <Button key={c} type="button" variant="outline" size="lg" className="h-12 w-full text-base" disabled={busy} onClick={() => start(c)}>{CHANNEL_LABEL[c]}</Button>
      ))}
    </form>
  );
}
