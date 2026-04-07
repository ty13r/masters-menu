import { NextResponse } from "next/server";
import { refreshAllLikes } from "@/lib/storage";
import { fetchLikes } from "@/lib/social-fetchers";

export async function POST() {
  const entries = await refreshAllLikes(fetchLikes);
  return NextResponse.json(entries);
}
