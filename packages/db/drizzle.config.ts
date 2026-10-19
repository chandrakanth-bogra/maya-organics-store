import { defineConfig } from 'drizzle-kit';

// Migrations are generated here and applied with `wrangler d1 migrations apply` from apps/store.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './migrations',
});
