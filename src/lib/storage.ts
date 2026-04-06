import fs from "fs/promises";
import path from "path";
import type { LeaderboardEntry, LeaderboardStore } from "./leaderboard-types";

const DATA_PATH = path.join(process.cwd(), "data", "leaderboard.json");

async function ensureFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(
      DATA_PATH,
      JSON.stringify({ entries: [], lastModified: "" })
    );
  }
}

export async function readStore(): Promise<LeaderboardStore> {
  await ensureFile();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as LeaderboardStore;
}

export async function writeStore(store: LeaderboardStore): Promise<void> {
  store.lastModified = new Date().toISOString();
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
}

export async function addEntry(
  entry: Omit<LeaderboardEntry, "id" | "submittedAt" | "updatedAt">
): Promise<LeaderboardEntry> {
  const store = await readStore();
  const now = new Date().toISOString();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    submittedAt: now,
    updatedAt: now,
  };
  store.entries.push(newEntry);
  await writeStore(store);
  return newEntry;
}

export async function updateEntry(
  id: string,
  updates: Partial<Pick<LeaderboardEntry, "socialPosts" | "totalLikes">>
): Promise<LeaderboardEntry | null> {
  const store = await readStore();
  const entry = store.entries.find((e) => e.id === id);
  if (!entry) return null;
  Object.assign(entry, updates, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return entry;
}

export async function getSortedEntries(): Promise<LeaderboardEntry[]> {
  const store = await readStore();
  return store.entries.sort((a, b) => {
    if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
}
