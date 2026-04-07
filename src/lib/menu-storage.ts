import { customAlphabet } from "nanoid";
import { ensureSchema, sql } from "./db";

// URL-safe alphabet, 8 chars ~= 218 trillion combinations
const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  8
);

export interface StoredMenu {
  id: string;
  data: string;
  honoree: string;
}

export async function saveMenu(
  encodedData: string,
  honoree: string
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
    INSERT INTO menus (id, data, honoree)
    VALUES (${id}, ${encodedData}, ${honoree})
  `;
  return id;
}

export async function getMenu(id: string): Promise<StoredMenu | null> {
  await ensureSchema();
  const result = await sql<StoredMenu>`
    SELECT id, data, honoree FROM menus WHERE id = ${id} LIMIT 1
  `;
  return result.rows[0] ?? null;
}
