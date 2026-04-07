import { ensureSchema, sql } from "./db";
import type {
  LeaderboardEntry,
  Platform,
  SocialPost,
} from "./leaderboard-types";

interface EntryRow {
  id: string;
  menu_id: string;
  honoree: string;
  total_likes: number;
  submitted_at: string;
  updated_at: string;
}

interface PostRow {
  entry_id: string;
  platform: Platform;
  url: string;
  like_count: number | null;
  last_fetched: string;
}

function rowsToEntries(
  entryRows: EntryRow[],
  postRows: PostRow[]
): LeaderboardEntry[] {
  const postsByEntry = new Map<string, SocialPost[]>();
  for (const p of postRows) {
    const list = postsByEntry.get(p.entry_id) ?? [];
    list.push({
      platform: p.platform,
      url: p.url,
      likeCount: p.like_count,
      lastFetched: new Date(p.last_fetched).toISOString(),
    });
    postsByEntry.set(p.entry_id, list);
  }
  return entryRows.map((r) => ({
    id: r.id,
    honoree: r.honoree,
    menuData: r.menu_id,
    socialPosts: postsByEntry.get(r.id) ?? [],
    totalLikes: r.total_likes,
    submittedAt: new Date(r.submitted_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }));
}

async function loadEntriesAndPosts(): Promise<{
  entries: EntryRow[];
  posts: PostRow[];
}> {
  const entriesResult = await sql<EntryRow>`
    SELECT id, menu_id, honoree, total_likes,
           submitted_at::text AS submitted_at,
           updated_at::text AS updated_at
    FROM leaderboard_entries
    ORDER BY total_likes DESC, submitted_at ASC
  `;
  const postsResult = await sql<PostRow>`
    SELECT entry_id, platform, url, like_count,
           last_fetched::text AS last_fetched
    FROM social_posts
  `;
  return { entries: entriesResult.rows, posts: postsResult.rows };
}

export async function addEntry(params: {
  honoree: string;
  menuId: string;
  socialPost: SocialPost;
  totalLikes: number;
}): Promise<LeaderboardEntry> {
  await ensureSchema();
  const id = crypto.randomUUID();

  await sql`
    INSERT INTO leaderboard_entries (id, menu_id, honoree, total_likes)
    VALUES (${id}, ${params.menuId}, ${params.honoree}, ${params.totalLikes})
  `;
  await sql`
    INSERT INTO social_posts (entry_id, platform, url, like_count, last_fetched)
    VALUES (
      ${id},
      ${params.socialPost.platform},
      ${params.socialPost.url},
      ${params.socialPost.likeCount},
      ${params.socialPost.lastFetched}
    )
  `;

  return {
    id,
    honoree: params.honoree,
    menuData: params.menuId,
    socialPosts: [params.socialPost],
    totalLikes: params.totalLikes,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function addSocialPostToEntry(
  entryId: string,
  post: SocialPost
): Promise<LeaderboardEntry | null> {
  await ensureSchema();
  const entryResult = await sql<EntryRow>`
    SELECT id, menu_id, honoree, total_likes,
           submitted_at::text AS submitted_at,
           updated_at::text AS updated_at
    FROM leaderboard_entries WHERE id = ${entryId}
  `;
  if (entryResult.rows.length === 0) return null;

  await sql`
    INSERT INTO social_posts (entry_id, platform, url, like_count, last_fetched)
    VALUES (
      ${entryId},
      ${post.platform},
      ${post.url},
      ${post.likeCount},
      ${post.lastFetched}
    )
  `;

  const postsResult = await sql<PostRow>`
    SELECT entry_id, platform, url, like_count,
           last_fetched::text AS last_fetched
    FROM social_posts WHERE entry_id = ${entryId}
  `;
  const totalLikes = postsResult.rows.reduce(
    (sum, p) => sum + (p.like_count ?? 0),
    0
  );
  await sql`
    UPDATE leaderboard_entries
    SET total_likes = ${totalLikes}, updated_at = NOW()
    WHERE id = ${entryId}
  `;

  return rowsToEntries(entryResult.rows, postsResult.rows)[0];
}

export async function getSortedEntries(): Promise<LeaderboardEntry[]> {
  await ensureSchema();
  const { entries, posts } = await loadEntriesAndPosts();
  return rowsToEntries(entries, posts);
}

export async function refreshAllLikes(
  fetcher: (platform: Platform, url: string) => Promise<number | null>
): Promise<LeaderboardEntry[]> {
  await ensureSchema();
  const { entries, posts } = await loadEntriesAndPosts();
  const now = new Date().toISOString();

  for (const post of posts) {
    const likes = await fetcher(post.platform, post.url);
    await sql`
      UPDATE social_posts
      SET like_count = ${likes}, last_fetched = ${now}
      WHERE entry_id = ${post.entry_id} AND url = ${post.url}
    `;
    post.like_count = likes;
    post.last_fetched = now;
  }

  for (const entry of entries) {
    const total = posts
      .filter((p) => p.entry_id === entry.id)
      .reduce((sum, p) => sum + (p.like_count ?? 0), 0);
    await sql`
      UPDATE leaderboard_entries
      SET total_likes = ${total}, updated_at = ${now}
      WHERE id = ${entry.id}
    `;
    entry.total_likes = total;
    entry.updated_at = now;
  }

  const sorted = [...entries].sort((a, b) => {
    if (b.total_likes !== a.total_likes) return b.total_likes - a.total_likes;
    return (
      new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );
  });

  return rowsToEntries(sorted, posts);
}
