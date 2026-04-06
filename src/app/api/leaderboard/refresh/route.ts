import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/storage";
import { fetchLikes } from "@/lib/social-fetchers";

export async function POST() {
  const store = await readStore();
  const now = new Date().toISOString();

  for (const entry of store.entries) {
    for (const post of entry.socialPosts) {
      const likes = await fetchLikes(post.platform, post.url);
      post.likeCount = likes;
      post.lastFetched = now;
    }
    entry.totalLikes = entry.socialPosts.reduce(
      (sum, p) => sum + (p.likeCount ?? 0),
      0
    );
    entry.updatedAt = now;
  }

  await writeStore(store);

  const sorted = store.entries.sort((a, b) => {
    if (b.totalLikes !== a.totalLikes) return b.totalLikes - a.totalLikes;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  return NextResponse.json(sorted);
}
