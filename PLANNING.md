# Maya Organics — eCommerce App Planning

## Progress Snapshot

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Scaffold Next.js 16 app | ✅ Done | TypeScript, App Router, `src/` dir |
| 2 | Design system | ✅ Done | globals.css, CSS vars, dark/light mode, fonts |
| 3 | Navbar + Footer | ✅ Done | Fixed nav, cart icon + badge, mobile hamburger |
| 4 | Homepage | ✅ Done | Hero, product grid, pillars, CTA band |
| 5 | Products listing page | ✅ Done | Static ISR, content from `src/data/products.ts`, prices from Supabase |
| 6 | Product detail page | ✅ Done | 3-column layout, gallery, variant pills (BuyBox), sticky buy box |
| 7 | Supabase setup + seed | ✅ Done | Schema includes `product_variants`, `cart_items` uses `variant_id` |
| 8 | Auth — email + password | ✅ Done | Supabase Auth, unified login/register, session via `@supabase/ssr`, proxy route guard |
| 9 | Cart | ✅ Done | CartContext variant-based, `/cart` page with qty controls + order summary |
| 10 | Checkout | ✅ Done | Address picker, coupon + volume discount, mock payment (returns success) |
| 11 | Order flow | ✅ Done | `/api/orders/create`, order confirmation, `/account/orders/[id]` |
| 12 | Account page | ✅ Done | Profile (upsert), Addresses CRUD, Orders tab, Security (password change) |
| 13 | Admin panel | ✅ Done | Dashboard, Products, Variants, Orders, Users, Inventory, Coupons, Vol. Discounts |
| 14 | Static product data | ✅ Done | `src/data/products.ts` — content static, prices/stock from Supabase via ISR |
| 15 | Razorpay integration | 🔲 Todo | Replace mock order creation with real payment flow |
| 16 | Shiprocket | 🔲 Todo | Shipment creation, tracking from admin |
| 17 | Reviews | 🔲 Todo | Verified purchase only |
| 18 | Soil calculator | 🔲 Todo | AI agent |
| 19 | Notifications | 🔲 Todo | Coming soon feature |

---

## Key Decisions Made

- **Auth**: Email + password via Supabase Auth — unified login/register page at `/auth/login`
- **Admin auth**: Email + password — admin identified by `ADMIN_EMAIL` env var in proxy route guard; also enforced in RLS via `email = 'mayaorganics5577@gmail.com'`
- **No signup trigger** — profile row upserted into `public.users` by app code after login/registration (uses `upsert` with `onConflict: "id"`)
- **Static product content** — all product copy, specs, highlights, images live in `src/data/products.ts`; only prices + `in_stock` come from Supabase. `generateStaticParams` uses the static file (no DB call at build time). Pages revalidate every hour (ISR).
- **Checkout — mock payment** — `POST /api/orders/create` creates order with `status: "confirmed"` directly; Razorpay to be wired later. Coupon validated server-side; volume discount auto-applied if no coupon.
- **Phone field**: Optional in profile — for future order notifications when Twilio is set up
- **Prices stored in paise** (₹99 = 9900) to avoid float issues
- **Product variants**: Each product has multiple variants (grain size + pack size). Pricing lives on `product_variants`, not `products`. `products.price` is kept as a "from" display price for the listing page only.
- **Cart uses `variant_id`**: `cart_items` and `order_items` reference `product_variants`, not `products`
- **Product detail page**: 3-column layout — col 1: image gallery, col 2: product info + specs, col 3: sticky buy box with variant selector + qty + add to cart + delivery info
- **Products page**: Static (SSG) with client-side filtering — no URL param needed
- **Dark mode toggle**: Floating circular button (fixed, bottom-right, above WhatsApp button) — global `ThemeContext` with `localStorage` persistence, default light
- **Responsiveness**: CSS classes for layout grids (media queries), inline styles only for theme colors
- **Dark mode**: `data-theme="dark"` on `<html>`, CSS vars only — never Tailwind `dark:` classes
- **Footer**: Always dark (`#1A1A1A`) regardless of theme
- **WhatsApp CTA**: Floating button only + contact page — removed from product detail page

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | TypeScript, `src/` dir |
| Styling | Tailwind v4 + CSS Variables | Semantic token system, dark mode via `data-theme="dark"` |
| Fonts | DM Serif Display + Poppins | via `next/font/google` |
| Database + Auth | Supabase (Postgres) | Row Level Security enabled |
| File Storage | Supabase Storage | Product images, user avatars |
| Payments | Razorpay | No COD. Coupon discount logic in app, final amount sent to Razorpay |
| Shipping | Shiprocket API | Create shipments, tracking, rates |
| Hosting | Vercel (free tier) | Auto-deploy from GitHub |
| Domain | Hostinger (DNS only) | CNAME → Vercel |

---

## Styling Rules (follow strictly)

- **Backgrounds that switch in dark mode** → `style={{ backgroundColor: "var(--bg-page / --bg-surface / --bg-subtle)" }}`
- **Text** → `style={{ color: "var(--text-primary / --text-secondary)" }}`
- **Borders** → `style={{ border: "1px solid var(--border-default)" }}`
- **Forms** → `.form-control` class (uses input tokens)
- **Fixed dark surfaces** (footer, CTA band) → `var(--footer-bg)` or hardcoded — never changes with theme
- **Layout** → `.section`, `.container`, Tailwind utilities for flex/grid
- **Buttons** → `.btn`, `.btn-primary`, `.btn-outline` etc. — never touch dark mode
- **Never use CSS classes for background colors** — inline styles + CSS vars only
- **Never override grid CSS classes with inline `gridTemplateColumns`** — breaks mobile media queries

---

## Products

8 products, all managed from admin panel:

| Slug | Name | Category | Grain Size Variants |
|---|---|---|---|
| `perlite` | Perlite | Volcanic Mineral | 3–8mm |
| `vermiculite` | Vermiculite | Hydrated Mineral | 2–6mm, 6–10mm |
| `pumice` | Pumice | Volcanic Rock | 2–4mm, 4–6mm, 6–10mm |
| `leca` | LECA | Expanded Clay | 8–15mm, 15–30mm |
| `zeolite` | Zeolite | Natural Mineral | 2–4mm |
| `cocopeat` | Cocopeat | Organic Medium | — (pack size only) |
| `vermicompost` | Vermicompost | Organic Fertiliser | — (pack size only) |
| `neem-cake` | Neem Cake | Organic Soil Amendment | — (pack size only) |

Product data fields:
- `name`, `slug`, `category`, `tagline`, `meta_description`
- `price`, `price_unit` — display "from" price for listing page only; actual prices are on `product_variants`
- `image_main`, `image_thumb`
- `highlights` (jsonb — array of strings, 6 bullet points)
- `specs` (jsonb — array of `{label, value}`, 6 pairs)
- `usage_note`
- `texture_class` (for background texture)
- `has_size_guide` (bool)

---

## Features

### 1. Users
- Login via **email + password** (Supabase Auth)
- Name collected at registration
- Phone optional — collected in profile (useful for order notifications when Twilio is live)
- Profile page — name, email, phone
- Multiple saved addresses (home, office, etc.) per user
- Admin identified by `ADMIN_EMAIL` env var in proxy route guard

### 2. Products / CMS
- All products managed from admin panel
- Edit: name, price, description, images, stock, specs, highlights
- **Variants managed separately** — admin adds grain size + pack size + price per variant
- No hardcoded product data — everything from Supabase DB

### 3. Cart
- Logged-in users only (no guest cart)
- Cart items reference `variant_id` — each grain size + pack size combination is a separate line item
- Add / remove / update quantity
- Persists across sessions (stored in Supabase `cart_items`)

### 4. Orders
- Customer places order → appears in admin
- Admin manually updates status: `Pending → Confirmed → Shipped → Delivered`
- Customer sees order history + current status on their profile

### 5. Payments — Razorpay
- Razorpay only (no COD)
- Supported: UPI, cards, net banking
- Coupon discount applied in app first → discounted amount sent to Razorpay
- Razorpay webhooks confirm payment before creating order in DB

### 6. Shipping — Shiprocket
- Create shipments from admin panel via Shiprocket API
- Auto-fetch tracking status
- Rate calculation at checkout

### 7. Reviews
- Verified purchase only (must have a delivered order for that product)
- Star rating + written review
- Displayed on product detail page

### 8. Coupons / Discount Codes
- Managed from admin panel
- Fields: code, discount type (% or flat), discount value, minimum order amount, usage limit, expiry date
- Applied at cart/checkout, validated server-side before payment

### 9. Volume / Bulk Discounts
- Managed from admin panel
- Triggered by order total
- Example: order ₹2000+ → 10% off, order ₹5000+ → 15% off
- Applied automatically at checkout

### 10. Inventory
- Stock levels managed per variant from admin panel
- Out-of-stock toggle per variant
- No automatic stock deduction for now (manual updates)

### 11. Notifications — Coming Soon
- Email / WhatsApp to customer when order status changes
- Not in v1, planned for later

### 12. Wishlist
- **Not building** — removed from scope

### 13. Soil Calculator
- Existing partial implementation in static site
- v2: AI agent will power it
- Deferred — will plan separately when we get to it

---

## Admin Panel

Single dashboard at `/admin` (protected route, admin-only).

Sections:
- **Products** — add / edit / delete, images, pricing, stock, specs, highlights
- **Variants** — add / edit / delete variants per product (grain size, pack size, price, stock)
- **Orders** — view all orders, update status, view customer details
- **Users** — view registered users
- **Coupons** — create / edit / delete discount codes
- **Volume Discounts** — manage bulk order discount tiers
- **Inventory** — stock levels, out-of-stock toggle per variant
- **Shipping** — create Shiprocket shipment, view tracking per order

---

## Database Schema (Supabase / Postgres)

```sql
users            -- auth.users extended with profile; no signup trigger — app code upserts
  id, email (not null), name, phone (nullable), created_at

addresses
  id, user_id, label, line1, line2, city, state, pincode, is_default

products
  id, slug, name, category, tagline, meta_description,
  price (display "from" price), price_unit (display unit),
  image_main, image_thumb, highlights (jsonb), specs (jsonb),
  usage_note, stock, in_stock, texture_class, has_size_guide

product_variants  -- actual sellable SKUs, managed from admin
  id, product_id (→ products), grain_size (nullable), pack_size,
  price (paise), in_stock, sort_order
  -- grain_size null for: cocopeat, vermicompost, neem-cake

cart_items
  id, user_id (→ users), variant_id (→ product_variants), quantity, created_at
  unique(user_id, variant_id)

orders
  id, user_id, status, subtotal, discount, total,
  coupon_code, shipping_address (jsonb), razorpay_order_id,
  razorpay_payment_id, shiprocket_shipment_id, created_at

order_items
  id, order_id, variant_id (→ product_variants), quantity, price_at_purchase

coupons
  id, code, discount_type (percent/flat), value, min_order_amount,
  usage_limit, used_count, expires_at, active

volume_discounts
  id, min_order_amount, discount_percent, label

reviews
  id, product_id, user_id, order_id, rating, body, created_at
  unique(product_id, user_id, order_id)
  -- only allowed if order exists with status = delivered
```

---

## Pages / Routes

### Customer-facing
| Route | Page |
|---|---|
| `/` | Homepage |
| `/products` | Products listing |
| `/products/[slug]` | Product detail — 3-col layout, variant selector, buy box |
| `/guides` | Guides listing |
| `/guides/[slug]` | Guide detail |
| `/about` | About |
| `/contact` | Contact + form |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/account` | Profile + addresses |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |
| `/auth/login` | Login + Register (unified, toggle between modes) |
| `/auth/callback` | Password reset / magic link callback |

### Admin
| Route | Page |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/products` | Product list |
| `/admin/products/[id]` | Edit product + manage variants |
| `/admin/orders` | Orders list |
| `/admin/orders/[id]` | Order detail + status update |
| `/admin/users` | Users list |
| `/admin/coupons` | Coupon management |
| `/admin/discounts` | Volume discount tiers |
| `/admin/inventory` | Stock management per variant |

---

## Build Order (Recommended)

1. ~~Scaffold Next.js app~~ ✅
2. ~~Design system (globals.css, fonts, tokens)~~ ✅
3. ~~Navbar + Footer~~ ✅
4. ~~Homepage~~ ✅
5. ~~Products listing page~~ ✅
6. ~~Supabase setup + seed products from CSV~~ ✅
7. ~~Auth (email + password, unified login/register)~~ ✅
8. ~~Static pages (guides, about, contact)~~ ✅
9. ~~Dark/light mode floating toggle~~ ✅
10. ~~Product detail page — 3-column layout + variant selector~~ ✅
11. ~~Cart — variant_id based, qty controls~~ ✅
12. ~~Account page — profile, addresses, orders, security~~ ✅
13. ~~Admin panel — all sections~~ ✅
14. ~~Static product data (`src/data/products.ts`) + ISR~~ ✅
15. ~~Checkout — address picker, coupon/discount, mock payment~~ ✅
16. ~~Order flow — create, confirm, history, detail~~ ✅
17. Razorpay integration — replace mock with real payment
18. Shiprocket integration
19. Reviews
20. Soil calculator (AI agent)
21. Notifications (coming soon)
