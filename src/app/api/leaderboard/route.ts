import { NextRequest, NextResponse } from "next/server";
import { addEntry, getSortedEntries } from "@/lib/storage";
import { fetchLikes } from "@/lib/social-fetchers";
import type { Platform, SocialPost } from "@/lib/leaderboard-types";

const VALID_PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "facebook"];

const PLATFORM_DOMAINS: Record<Platform, string[]> = {
  x: ["twitter.com", "x.com"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com"],
};

function isValidUrlForPlatform(url: string, platform: Platform): boolean {
  try {
    const parsed = new URL(url);
    return PLATFORM_DOMAINS[platform].some((d) => parsed.hostname.includes(d));
  } catch {
    return false;
  }
}

export async function GET() {
  const entries = await getSortedEntries();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { honoree, menuData, platform, postUrl } = body;

  if (!honoree || typeof honoree !== "string") {
    return NextResponse.json({ error: "honoree is required" }, { status: 400 });
  }
  if (!menuData || typeof menuData !== "string") {
    return NextResponse.json(
      { error: "menuData is required" },
      { status: 400 }
    );
  }
  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: "Invalid platform" },
      { status: 400 }
    );
  }
  if (!postUrl || !isValidUrlForPlatform(postUrl, platform)) {
    return NextResponse.json(
      { error: `Invalid URL for ${platform}` },
      { status: 400 }
    );
  }

  const likeCount = await fetchLikes(platform, postUrl);
  const now = new Date().toISOString();

  const socialPost: SocialPost = {
    platform,
    url: postUrl,
    likeCount,
    lastFetched: now,
  };

  const entry = await addEntry({
    honoree,
    menuData,
    socialPosts: [socialPost],
    totalLikes: likeCount ?? 0,
  });

  return NextResponse.json(entry, { status: 201 });
}
