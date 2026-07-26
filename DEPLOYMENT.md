# Maya Organics — Cloudflare Deployment Guide

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.11 (App Router) |
| Adapter | @opennextjs/cloudflare 1.20.2 |
| Runtime | Cloudflare Workers (edge) |
| Database | Cloudflare D1 (SQLite-compatible) |
| ORM | Drizzle ORM |
| Auth | better-auth 1.6.18 |
| CLI | wrangler 4.x |

---

## Architecture Notes

- **No more better-sqlite3** — replaced with Cloudflare D1 (`drizzle-orm/d1`)
- **Per-request DB** — `getDb()` calls `getCloudflareContext()` on every request; no singleton
- **Per-request auth** — `getAuth()` factory, same pattern
- **All server pages** have `export const dynamic = "force-dynamic"` — required because `getCloudflareContext()` fails at build-time static pre-rendering
- **Secrets** are stored as Cloudflare Worker secrets (not in code or wrangler.toml)

---

## One-Time Setup (already done)

These steps were completed during initial migration — document for reference:

```bash
# 1. Install Cloudflare adapter
npm install @opennextjs/cloudflare
npm install -D wrangler @cloudflare/workers-types

# 2. Login to Cloudflare
npx wrangler login --no-browser   # use --no-browser if browser auth fails (CSRF)

# 3. Create D1 database
npx wrangler d1 create maya-organics-db
# → copies database_id into wrangler.toml

# 4. Apply schema locally (for local dev)
npx wrangler d1 execute maya-organics-db --local --file=drizzle/0000_glossy_gressill.sql

# 5. Apply schema to production D1
npx wrangler d1 execute maya-organics-db --remote --file=drizzle/0000_glossy_gressill.sql

# 6. Set auth secret (generate once, store as Worker secret)
npx wrangler secret put BETTER_AUTH_SECRET
# paste a value from: openssl rand -base64 32
```

---

## Deploy (every release)

```bash
# Build
npx opennextjs-cloudflare build

# Deploy  (wrangler detects OpenNext and calls opennextjs-cloudflare deploy internally)
npx wrangler deploy
```

Or add to package.json:
```json
"build:cf": "opennextjs-cloudflare build",
"deploy": "opennextjs-cloudflare deploy"
```

Then: `npm run build:cf && npm run deploy`

---

## Environment Variables

Stored in `wrangler.toml` as `[vars]` (plain text, safe for non-secrets):

| Variable | Value |
|---|---|
| `BETTER_AUTH_URL` | `https://mayaorganics.store` |
| `ADMIN_EMAIL` | `mayaorganics5577@gmail.com` |

Stored as Cloudflare Worker secrets (encrypted, set via wrangler):

| Secret | How to set |
|---|---|
| `BETTER_AUTH_SECRET` | `npx wrangler secret put BETTER_AUTH_SECRET` |

---

## wrangler.toml Reference

```toml
name = "maya-organics-store"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"

[[d1_databases]]
binding = "DB"
database_name = "maya-organics-db"
database_id = "6ec67a80-ee27-46d5-8ad0-9fa0654f019e"

[vars]
BETTER_AUTH_URL = "https://mayaorganics.store"
ADMIN_EMAIL = "mayaorganics5577@gmail.com"

# After domain is on Cloudflare — uncomment and redeploy:
# routes = [
#   { pattern = "mayaorganics.store/*", zone_name = "mayaorganics.store" },
#   { pattern = "www.mayaorganics.store/*", zone_name = "mayaorganics.store" }
# ]
```

---

## Custom Domain Setup (mayaorganics.store)

### Step 1 — Add domain to Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a Site**
2. Enter `mayaorganics.store` → **Free plan**
3. Note the two **Cloudflare nameservers** shown (e.g. `nash.ns.cloudflare.com`)

### Step 2 — Update GoDaddy nameservers

1. GoDaddy → My Products → DNS for `mayaorganics.store`
2. Change nameservers to the two from Step 1
3. Propagation: 30 min to 48 hours

### Step 3 — Connect domain to Worker

**Option A — wrangler.toml routes (recommended):**

Uncomment the `routes` block at the bottom of `wrangler.toml`, then redeploy:
```bash
npx wrangler deploy
```

**Option B — Cloudflare dashboard:**

Workers & Pages → `maya-organics-store` → Settings → Triggers → Add Custom Domain → `mayaorganics.store`

### Step 4 — Add www redirect (optional)

In Cloudflare dashboard: DNS → add a CNAME `www → mayaorganics.store` (proxied), then add a Page Rule or Redirect Rule: `www.mayaorganics.store/*` → `https://mayaorganics.store/$1`.

---

## Schema Migrations (future changes)

```bash
# 1. Edit schema files in src/lib/db/schema/
# 2. Generate migration SQL
npx drizzle-kit generate

# 3. Apply locally (test first)
npx wrangler d1 execute maya-organics-db --local --file=drizzle/<new-migration>.sql

# 4. Apply to production
npx wrangler d1 execute maya-organics-db --remote --file=drizzle/<new-migration>.sql

# 5. Rebuild and redeploy
npx opennextjs-cloudflare build && npx wrangler deploy
```

---

## Seed Data (development)

Seed scripts require `better-sqlite3` for local use — they can't use D1 directly.
To seed the remote D1, apply SQL directly:

```bash
# Generate seed SQL from scripts, then:
npx wrangler d1 execute maya-organics-db --remote --command "INSERT INTO products ..."
```

Or use Drizzle Studio (requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN in `.env`):
```bash
npx drizzle-kit studio
```

---

## Local Development

```bash
npm run dev        # starts Next.js dev server (next dev)
```

Local D1 is stored in `.wrangler/state/v3/d1/`. Apply schema locally first:
```bash
npx wrangler d1 execute maya-organics-db --local --file=drizzle/0000_glossy_gressill.sql
```

Secrets for local dev go in `.dev.vars` (git-ignored):
```
BETTER_AUTH_SECRET=any-local-secret
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAIL=mayaorganics5577@gmail.com
```

---

## Deployment Checklist

- [ ] Schema applied to remote D1 (`--remote` flag)
- [ ] `BETTER_AUTH_SECRET` set as Worker secret
- [ ] `BETTER_AUTH_URL` in wrangler.toml matches live domain
- [ ] `ADMIN_EMAIL` in wrangler.toml is correct
- [ ] Build succeeds (`npx opennextjs-cloudflare build`)
- [ ] Deploy succeeds (`npx wrangler deploy`)
- [ ] Live URL returns 200
- [ ] Auth login works on live URL
- [ ] Admin login works (`/admin`)
- [ ] Custom domain added and HTTPS working
