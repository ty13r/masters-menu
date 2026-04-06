import type { Platform } from "./leaderboard-types";

export async function fetchXLikes(url: string): Promise<number | null> {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (!match) return null;
  const tweetId = match[1];
  const token = Math.random().toString(36).substring(2, 8);
  try {
    const res = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${token}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.favorite_count === "number" ? data.favorite_count : null;
  } catch {
    return null;
  }
}

export async function fetchTikTokLikes(url: string): Promise<number | null> {
  try {
    const { fetchVideo } = await import("@prevter/tiktok-scraper");
    const video = await fetchVideo(url);
    return typeof video.likes === "number" ? video.likes : null;
  } catch {
    return null;
  }
}

export async function fetchInstagramLikes(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const likeMatch = html.match(/"like_count"\s*:\s*(\d+)/);
    if (likeMatch) return parseInt(likeMatch[1], 10);
    const ogMatch = html.match(
      /content="([\d,]+) likes?/i
    );
    if (ogMatch) return parseInt(ogMatch[1].replace(/,/g, ""), 10);
    return null;
  } catch {
    return null;
  }
}

export async function fetchLikes(
  platform: Platform,
  url: string
): Promise<number | null> {
  switch (platform) {
    case "x":
      return fetchXLikes(url);
    case "tiktok":
      return fetchTikTokLikes(url);
    case "instagram":
      return fetchInstagramLikes(url);
    case "facebook":
      return null;
  }
}
