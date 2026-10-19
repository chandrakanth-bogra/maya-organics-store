# Maya Organics Store — Plan (v2: Astro rebuild)

Retail store for `mayaorganics.store`. Rebuilt on **Astro + React islands** for SEO, speed and AI agents.
The Next.js version (in git history, commit `a2d2f0a`) never went live and has no data; its design,
DB schema and API logic are reused.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Astro (Cloudflare adapter). Content pages = plain HTML, React islands only for cart/checkout/admin |
| Components | shadcn/ui (React) + Tailwind v4, brand colours as tokens. No inline colour styles |
| Domains | Keep two: `mayaorganics.store` (retail), `www.mayaorganics.org` (B2B). Cross-linked |
| Catalogue | Store D1 `maya-organics-db` is the **master** for products, sizes, prices, stock. The WhatsApp bot reads/writes it (D1 binding) |
| Customers | **Accounts by phone number.** Login with a one-time code via WhatsApp or SMS (see Login below). Same phone = same customer in the store and the WhatsApp bot |
| Admin | Separate app at **`admin.mayaorganics.store`** (own Worker, same D1), gated by Cloudflare Access (team emails) |
| Payment v1 | Order saved as *pending payment* → bot alerts team → team sends Zoho quote/invoice + payment details on WhatsApp |
| Payment v2 | Razorpay (UPI/cards) with signed webhook; agent payments when available in India |
| Agents | Agent-ready from day one: JSON-LD, `llms.txt`, Markdown pages, public API, MCP server, product feeds |
| Hosting | Cloudflare Workers (free plan target), D1, KV for cache |

## Architecture

| Layer | Where |
|---|---|
| Frontend | Astro pages (static where possible) + React islands (cart, checkout, admin) |
| Backend | Astro server endpoints in the same Worker: `/api/*`, `/mcp`, feeds |
| Database | D1 `maya-organics-db` (catalogue, orders). Drizzle ORM, migrations in repo |
| Content | Astro content collections: product copy + guides in Markdown (specs, highlights, FAQs) |
| Prices on pages | Product pages rendered on the server and edge-cached; cache purged when a price/stock changes, so HTML + JSON-LD always show the live price |
| Bot link | Store → bot: service binding (new order alert). Bot → store DB: D1 binding (catalogue) |
| Security | HTTPS + HSTS, Turnstile on checkout/forms, WAF managed rules, rate limits, strict CSP, server-side price calculation, Access on `/admin`, signed webhooks |

## Login (customers)

better-auth with the phone-number plugin; sessions in D1, cookie only on `mayaorganics.store` (not `admin.`).

| Method | Cost | How |
|---|---|---|
| 1. **Verify on WhatsApp** (default) | Free | "Continue with WhatsApp" opens `wa.me` with a pre-filled code; the bot sees it came from that number and signs the browser in. Customer-started chats are free |
| 2. WhatsApp code | ~₹0.12 per code | Bot sends a Meta *authentication* template with a 6-digit code |
| 3. SMS code | Free at low volume, then ~₹0.15–0.25 | Start: Android phone + own SIM as SMS gateway. Later: DLT registration + MSG91 / 2Factor |
| Repeat logins | Free | Long sessions (60 days) + optional passkey (fingerprint/face) |

OTP rules: Turnstile before sending (stops SMS-pumping fraud), 6 digits, 5-minute expiry, max 5 tries, hashed in D1, rate limit per phone and per IP.

## Phases

### Phase 0 — Lock down the old deployment
- [x] Take the Next.js Worker `maya-organics-store` off workers.dev (open admin sign-up hole) until the new store launches
- [ ] Archive old repo `MayaOrganics`, delete its Worker `mayaorganics`

### Phase 1 — Foundation
- [x] Astro scaffold on branch `astro`, Cloudflare adapter, Tailwind v4 + brand tokens, shadcn/ui (Button now; Input, Sheet, Dialog, Toast, Table added with cart/admin)
- [x] Layout: navbar, footer, dark mode (`data-theme`), WhatsApp button, self-hosted fonts
- [x] D1 catalogue schema (Drizzle): products, variants (grain + pack size, price in paise, GST rate, stock, Amazon SKU, catalogue ID, Zoho item), price audit. Orders/coupons tables come in Phase 3
- [x] Seed the real catalogue: 9 products incl. Pine Bark, bot price list (one size each until real sizes are known), GST-inclusive
- [ ] Bot: bind store D1, move `price` / `out` / `in` commands and quotes to the shared catalogue

### Phase 2 — Storefront + SEO
- [ ] Pages: home, products, product detail (size picker), guides (6 existing + 3 from old site), about, contact, shipping, returns, privacy, terms
- [ ] JSON-LD: Product + Offer (price, availability, GST incl.), BreadcrumbList, Organization/LocalBusiness, FAQPage, HowTo (guides)
- [ ] `sitemap.xml` (+ images, lastmod), `robots.txt` with content signals, canonical tags, Open Graph images
- [ ] Performance budget: LCP < 2 s on 4G, < 50 KB JS on content pages, Lighthouse ≥ 95, AVIF/WebP images

### Phase 3 — Accounts + cart + checkout (pay on WhatsApp)
- [ ] Phone login: verify on WhatsApp (bot endpoint), WhatsApp code, SMS code; passkeys
- [ ] Account: profile, addresses, GSTIN (for B2B invoices), orders, reorder
- [ ] Cart island (synced to account), checkout: address, pincode, Turnstile
- [ ] `POST /api/orders`: prices recalculated on the server, D1 batch write, status `pending_payment`
- [ ] Bot alert to team with order + 📝 Quote / 🧾 Invoice buttons (Zoho), customer gets order summary on WhatsApp
- [ ] `admin.mayaorganics.store` (Access): orders + status, products/sizes/prices, inventory, coupons, customers

### Phase 4 — Agent layer
- [ ] `llms.txt`, `llms-full.txt`, `.md` version of every page (+ `Accept: text/markdown`)
- [ ] Public read API `/api/v1/products`, `/api/v1/products/{slug}` with OpenAPI spec
- [ ] MCP server `/mcp` (Cloudflare Agents SDK): `search_products`, `get_product`, `check_stock`, `price_cart` (GST + delivery), `create_order` (pending, team confirms), `order_status`
- [ ] Product feeds: Google Merchant Center, Meta catalogue (auto-syncs WhatsApp catalogue), Bing
- [ ] IndexNow / Crawler Hints on publish and price change

### Phase 5 — Launch
- [ ] `mayaorganics.store`: GoDaddy nameservers → Cloudflare, custom domain on the Worker, Always HTTPS, HSTS, www → apex redirect
- [ ] Google Search Console, Bing Webmaster Tools, Merchant Center, Google Business Profile
- [ ] Fix `.org` footer link to the store, cross-link B2B ↔ retail
- [ ] Retire the Next.js Worker

### Phase 6 — Payments
- [ ] Razorpay checkout (UPI/cards), webhook signature check → `paid`, Zoho invoice after payment
- [ ] Agent payments (ACP / AP2 / UPI agent pay) once usable in India

### Phase 7 — After launch
- [ ] Shiprocket shipments + tracking
- [ ] WhatsApp order-status templates (confirmed / shipped / delivered)
- [ ] Verified reviews → AggregateRating stars
- [ ] Soil calculator (port, then AI)
- [ ] Amazon SKU ↔ variant stock sync

## Open questions

- Sizes per product: which grain and pack sizes do you actually sell, at what price?
- GoDaddy login for `mayaorganics.store`
- Razorpay account status (KYC)
- Delivery charges: flat, free above ₹X, or by pincode?
