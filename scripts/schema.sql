-- =============================================
-- MAYA ORGANICS — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- USERS (extends auth.users)
-- Auth is email + password via Supabase Auth.
-- Phone is optional (for future order notifications).
-- Profile row is upserted by app code after login/registration — no trigger.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  phone       text,                              -- optional
  created_at  timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- ADDRESSES
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  label       text not null default 'Home',
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     text not null,
  is_default  boolean default false,
  created_at  timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "Users can manage own addresses" on public.addresses for all using (auth.uid() = user_id);

-- PRODUCTS
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  category         text not null,
  tagline          text,
  meta_description text,
  price            integer not null,             -- in paise — display "from" price for listing page
  price_unit       text not null default '225g pouch', -- display unit for listing page
  image_main       text,
  image_thumb      text,
  highlights       jsonb default '[]',           -- array of strings
  specs            jsonb default '[]',           -- array of {label, value}
  usage_note       text,
  stock            integer default 999,
  in_stock         boolean default true,
  texture_class    text default 'texture-default',
  has_size_guide   boolean default false,
  created_at       timestamptz default now()
);
alter table public.products enable row level security;
create policy "Products are publicly readable" on public.products for select using (true);
create policy "Admins can manage products" on public.products for all using (
  exists (select 1 from public.users where id = auth.uid() and email = 'mayaorganics5577@gmail.com')
);

-- PRODUCT VARIANTS
-- Actual sellable SKUs. Each variant = one grain size + pack size combination.
-- grain_size is null for non-granular products (cocopeat, vermicompost, neem cake).
-- Managed entirely from admin panel.
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  grain_size  text,                              -- e.g. "3–8mm", "8–15mm" — null if not applicable
  pack_size   text not null,                     -- e.g. "250g", "500g", "1kg", "5kg"
  price       integer not null,                  -- in paise (₹99 = 9900)
  in_stock    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz default now()
);
alter table public.product_variants enable row level security;
create policy "Variants are publicly readable" on public.product_variants for select using (true);
create policy "Admins can manage variants" on public.product_variants for all using (
  exists (select 1 from public.users where id = auth.uid() and email = 'mayaorganics5577@gmail.com')
);

-- ORDERS
create table if not exists public.orders (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id),
  status                 text not null default 'pending'
                           check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal               integer not null,       -- in paise
  discount               integer default 0,      -- in paise
  total                  integer not null,        -- in paise
  coupon_code            text,
  shipping_address       jsonb not null,
  razorpay_order_id      text,
  razorpay_payment_id    text,
  shiprocket_shipment_id text,
  created_at             timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" on public.orders for insert with check (auth.uid() = user_id);

-- ORDER ITEMS
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  variant_id        uuid not null references public.product_variants(id),
  quantity          integer not null check (quantity > 0),
  price_at_purchase integer not null             -- in paise, snapshot at time of order
);
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
);

-- CART
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, variant_id)
);
alter table public.cart_items enable row level security;
create policy "Users can manage own cart" on public.cart_items for all using (auth.uid() = user_id);

-- COUPONS
create table if not exists public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  discount_type    text not null check (discount_type in ('percent', 'flat')),
  value            integer not null,             -- percent (0–100) or flat paise amount
  min_order_amount integer default 0,            -- minimum order total in paise
  usage_limit      integer,
  used_count       integer default 0,
  expires_at       timestamptz,
  active           boolean default true,
  created_at       timestamptz default now()
);
alter table public.coupons enable row level security;
create policy "Coupons are publicly readable (active only)" on public.coupons for select using (active = true);

-- VOLUME DISCOUNTS
create table if not exists public.volume_discounts (
  id               uuid primary key default gen_random_uuid(),
  min_order_amount integer not null,             -- in paise
  discount_percent integer not null,
  label            text
);
alter table public.volume_discounts enable row level security;
create policy "Volume discounts are publicly readable" on public.volume_discounts for select using (true);

-- REVIEWS
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.users(id),
  order_id   uuid not null references public.orders(id),
  rating     integer not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz default now(),
  unique(product_id, user_id, order_id)
);
alter table public.reviews enable row level security;
create policy "Reviews are publicly readable" on public.reviews for select using (true);
create policy "Users can create reviews for delivered orders" on public.reviews for insert with check (
  auth.uid() = user_id and
  exists (
    select 1 from public.orders
    where id = order_id and user_id = auth.uid() and status = 'delivered'
  )
);
