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
      await pool.sql`
        CREATE TABLE IF NOT EXISTS leaderboard_entries (
          id TEXT PRIMARY KEY,
          menu_id TEXT NOT NULL,
          honoree TEXT NOT NULL,
          total_likes INTEGER DEFAULT 0,
          submitted_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS social_posts (
          id SERIAL PRIMARY KEY,
          entry_id TEXT NOT NULL REFERENCES leaderboard_entries(id) ON DELETE CASCADE,
          platform TEXT NOT NULL,
          url TEXT NOT NULL,
          like_count INTEGER,
          last_fetched TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await pool.sql`
        CREATE INDEX IF NOT EXISTS idx_leaderboard_total_likes
        ON leaderboard_entries(total_likes DESC)
      `;
      await pool.sql`
        CREATE INDEX IF NOT EXISTS idx_social_posts_entry
        ON social_posts(entry_id)
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
