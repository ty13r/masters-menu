import { NextRequest, NextResponse } from "next/server";
import { addSocialPostToEntry } from "@/lib/storage";
import { fetchLikes } from "@/lib/social-fetchers";
import type { Platform, SocialPost } from "@/lib/leaderboard-types";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { platform, postUrl } = body;

  if (!platform || !postUrl || !isValidUrlForPlatform(postUrl, platform)) {
    return NextResponse.json(
      { error: "Valid platform and postUrl required" },
      { status: 400 }
    );
  }

  const likeCount = await fetchLikes(platform, postUrl);
  const now = new Date().toISOString();

  const newPost: SocialPost = {
    platform,
    url: postUrl,
    likeCount,
    lastFetched: now,
  };

  const entry = await addSocialPostToEntry(id, newPost);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  return NextResponse.json(entry);
}
