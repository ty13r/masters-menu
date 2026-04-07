import { createPool, type VercelPool } from "@vercel/postgres";

// Vercel/Neon env vars are prefixed PROD_ in this project.
// The @vercel/postgres default client reads POSTGRES_URL, so we
// create our own pool with an explicit connection string.
const connectionString =
  process.env.PROD_POSTGRES_URL ||
  process.env.PROD_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

let poolSingleton: VercelPool | null = null;

function getPool(): VercelPool {
  if (!connectionString) {
    throw new Error(
      "No Postgres connection string found. Expected PROD_POSTGRES_URL or POSTGRES_URL in env."
    );
  }
  if (!poolSingleton) {
    poolSingleton = createPool({ connectionString });
  }
  return poolSingleton;
}

export const sql: VercelPool["sql"] = (...args: Parameters<VercelPool["sql"]>) =>
  getPool().sql(...args);

export const query: VercelPool["query"] = ((...args: Parameters<VercelPool["query"]>) =>
  getPool().query(...args)) as VercelPool["query"];

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const pool = getPool();
      await pool.sql`
        CREATE TABLE IF NOT EXISTS menus (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          honoree TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await pool.sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS theme TEXT`;
      await pool.sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0`;
      await pool.sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE`;
      await pool.sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE`;
      await pool.sql`ALTER TABLE menus ADD COLUMN IF NOT EXISTS popularity_boost INTEGER NOT NULL DEFAULT 0`;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS menu_likes (
          menu_id TEXT REFERENCES menus(id) ON DELETE CASCADE,
          fingerprint TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (menu_id, fingerprint)
        )
      `;
      await pool.sql`
        CREATE INDEX IF NOT EXISTS idx_menus_popularity
        ON menus((like_count + popularity_boost) DESC)
      `;
      await pool.sql`
        CREATE INDEX IF NOT EXISTS idx_menus_created
        ON menus(created_at DESC)
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS ai_rate_limits (
          ip TEXT PRIMARY KEY,
          window_start TIMESTAMPTZ NOT NULL,
          count INTEGER NOT NULL DEFAULT 0
        )
      `;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
