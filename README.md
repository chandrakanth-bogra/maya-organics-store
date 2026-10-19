# Maya Organics — Store

Retail store for **mayaorganics.store**: Astro + React islands on Cloudflare Workers, D1 database.
See [PLANNING.md](PLANNING.md) for decisions and phases.

## Layout

```
apps/store      Storefront (Astro). Worker `maya-organics-store`
packages/db     Shared D1 schema (Drizzle), queries, migrations, seed
```

- Prices, sizes and stock: D1 `maya-organics-db` (shared with the WhatsApp bot). Money in paise, GST included.
- Product copy (descriptions, highlights, specs, FAQs): `apps/store/src/content/products/<slug>.md`.
- Product photos: `apps/store/src/assets/images` (resized to AVIF/WebP automatically).

## Develop

```
npm install
cd apps/store
npx wrangler d1 migrations apply maya-organics-db --local
npx wrangler d1 execute maya-organics-db --local --file=../../packages/db/seed/catalogue.sql
npx astro dev
```

Checks: `npm run check` (types), `npm test`.

## Database changes

1. Edit `packages/db/src/schema.ts`
2. `npm run generate -w @maya/db` (writes SQL to `packages/db/migrations`)
3. `cd apps/store && npx wrangler d1 migrations apply maya-organics-db --local`, then `--remote` when ready

## Deploy

```
cd apps/store
npx astro build && npx wrangler deploy
```
