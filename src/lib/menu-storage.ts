import { customAlphabet } from "nanoid";
import { ensureSchema, query, sql } from "./db";

// URL-safe alphabet, 8 chars ~= 218 trillion combinations
const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  8
);

export interface StoredMenu {
  id: string;
  data: string;
  honoree: string;
  theme: string | null;
  likeCount: number;
  featured: boolean;
  hidden: boolean;
  popularityBoost: number;
  createdAt: string;
}

interface MenuRow {
  id: string;
  data: string;
  honoree: string;
  theme: string | null;
  like_count: number;
  featured: boolean;
  hidden: boolean;
  popularity_boost: number;
  created_at: string;
}

function rowToMenu(r: MenuRow): StoredMenu {
  return {
    id: r.id,
    data: r.data,
    honoree: r.honoree,
    theme: r.theme,
    likeCount: r.like_count,
    featured: r.featured,
    hidden: r.hidden,
    popularityBoost: r.popularity_boost,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function saveMenu(
  encodedData: string,
  honoree: string,
  theme: string | null = null
): Promise<string> {
  await ensureSchema();

  // Dedup: if this exact encoded blob already exists, reuse its id
  const existing = await sql<{ id: string }>`
    SELECT id FROM menus
    WHERE data = ${encodedData} AND honoree = ${honoree}
    LIMIT 1
  `;
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const id = nanoid();
  await sql`
    INSERT INTO menus (id, data, honoree, theme)
    VALUES (${id}, ${encodedData}, ${honoree}, ${theme})
  `;
  return id;
}

export async function getMenu(id: string): Promise<StoredMenu | null> {
  await ensureSchema();
  const result = await sql<MenuRow>`
    SELECT id, data, honoree, theme, like_count, featured, hidden,
           popularity_boost, created_at::text AS created_at
    FROM menus WHERE id = ${id} LIMIT 1
  `;
  return result.rows[0] ? rowToMenu(result.rows[0]) : null;
}

export interface ListMenusOptions {
  theme?: string | null;
  sort?: "popular" | "recent";
  limit?: number;
  offset?: number;
  exclude?: string;
  includeHidden?: boolean;
  search?: string;
}

export async function listMenus(
  opts: ListMenusOptions = {}
): Promise<StoredMenu[]> {
  await ensureSchema();
  const {
    theme,
    sort = "popular",
    limit = 60,
    offset = 0,
    exclude,
    includeHidden = false,
    search,
  } = opts;

  // Build dynamic SQL — @vercel/postgres `sql` template doesn't easily support
  // optional fragments, so we use the lower-level pool.query via sql.query.
  const where: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (!includeHidden) where.push(`hidden = FALSE`);
  if (theme) {
    where.push(`theme = $${i++}`);
    values.push(theme);
  }
  if (exclude) {
    where.push(`id <> $${i++}`);
    values.push(exclude);
  }
  if (search) {
    where.push(`honoree ILIKE $${i++}`);
    values.push(`%${search}%`);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderClause =
    sort === "recent"
      ? `ORDER BY created_at DESC`
      : `ORDER BY featured DESC, (like_count + popularity_boost) DESC, created_at DESC`;

  const queryText = `
    SELECT id, data, honoree, theme, like_count, featured, hidden,
           popularity_boost, created_at::text AS created_at
    FROM menus
    ${whereClause}
    ${orderClause}
    LIMIT $${i++} OFFSET $${i++}
  `;
  values.push(limit, offset);

  const result = await query<MenuRow>(queryText, values);
  return result.rows.map(rowToMenu);
}

export async function addLike(
  menuId: string,
  fingerprint: string
): Promise<{ liked: boolean; likeCount: number }> {
  await ensureSchema();
  const ins = await sql`
    INSERT INTO menu_likes (menu_id, fingerprint)
    VALUES (${menuId}, ${fingerprint})
    ON CONFLICT (menu_id, fingerprint) DO NOTHING
  `;
  if (ins.rowCount && ins.rowCount > 0) {
    await sql`UPDATE menus SET like_count = like_count + 1 WHERE id = ${menuId}`;
  }
  const r = await sql<{ like_count: number }>`
    SELECT like_count FROM menus WHERE id = ${menuId} LIMIT 1
  `;
  return {
    liked: (ins.rowCount ?? 0) > 0,
    likeCount: r.rows[0]?.like_count ?? 0,
  };
}

export interface AdminMenuUpdate {
  hidden?: boolean;
  featured?: boolean;
  popularityBoost?: number;
  theme?: string | null;
}

export async function updateMenu(
  id: string,
  patch: AdminMenuUpdate
): Promise<void> {
  await ensureSchema();
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.hidden !== undefined) {
    sets.push(`hidden = $${i++}`);
    values.push(patch.hidden);
  }
  if (patch.featured !== undefined) {
    sets.push(`featured = $${i++}`);
    values.push(patch.featured);
  }
  if (patch.popularityBoost !== undefined) {
    sets.push(`popularity_boost = $${i++}`);
    values.push(patch.popularityBoost);
  }
  if (patch.theme !== undefined) {
    sets.push(`theme = $${i++}`);
    values.push(patch.theme);
  }
  if (sets.length === 0) return;
  values.push(id);
  await query(
    `UPDATE menus SET ${sets.join(", ")} WHERE id = $${i}`,
    values
  );
}

export async function deleteMenu(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM menus WHERE id = ${id}`;
}

export async function countMenus(includeHidden = true): Promise<number> {
  await ensureSchema();
  const r = includeHidden
    ? await sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM menus`
    : await sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM menus WHERE hidden = FALSE`;
  return Number(r.rows[0]?.count ?? 0);
}
