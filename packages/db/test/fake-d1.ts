/** In-memory D1 for tests: node:sqlite with the real migrations and seed. */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { getDb } from '../src/index';

const dir = new URL('../migrations/', import.meta.url);
const scripts = [
  ...fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => fs.readFileSync(new URL(f, dir), 'utf8')),
  fs.readFileSync(new URL('../seed/catalogue.sql', import.meta.url), 'utf8'),
];

export function fakeD1() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  for (const s of scripts) sqlite.exec(s.replace(/--> statement-breakpoint/g, ''));
  const conv = (v: unknown) => (typeof v === 'boolean' ? (v ? 1 : 0) : v);
  const statement = (sql: string, params: unknown[] = []): any => ({
    bind: (...p: unknown[]) => statement(sql, p.map(conv)),
    async all() { return { results: sqlite.prepare(sql).all(...(params as any[])), success: true, meta: {} }; },
    async run() { const r = sqlite.prepare(sql).run(...(params as any[])); return { success: true, results: [], meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
    async first(col?: string) { const row: any = sqlite.prepare(sql).get(...(params as any[])); return row ? (col ? row[col] : row) : null; },
    async raw() { const st = sqlite.prepare(sql); st.setReturnArrays(true); return st.all(...(params as any[])); },
    _sql: sql, _params: params,
  });
  const d1: any = {
    prepare: (sql: string) => statement(sql),
    async batch(stmts: any[]) {
      sqlite.exec('BEGIN');
      try {
        const out = stmts.map((s) => {
          const st = sqlite.prepare(s._sql);
          return st.columns().length ? { results: st.all(...s._params), success: true, meta: {} } : (st.run(...s._params), { results: [], success: true, meta: {} });
        });
        sqlite.exec('COMMIT');
        return out;
      } catch (e) { sqlite.exec('ROLLBACK'); throw e; }
    },
  };
  return { d1, db: getDb(d1), sqlite };
}
