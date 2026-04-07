"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardEntry, Platform } from "@/lib/leaderboard-types";

const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-gray-100 text-gray-700 border-gray-300",
  3: "bg-orange-100 text-orange-800 border-orange-300",
};

const RANK_EMOJI: Record<number, string> = {
  1: "\uD83E\uDD47",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD49",
};

function getPlatformLikes(
  entry: LeaderboardEntry,
  platform: Platform
): number | null {
  const post = entry.socialPosts.find((p) => p.platform === platform);
  return post ? post.likeCount : null;
}

export default function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        setEntries(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/leaderboard/refresh", { method: "POST" });
      if (res.ok) {
        setEntries(await res.json());
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading popular menus...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          No menus shared yet. Be the first!
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-[#006747] text-white rounded-lg font-medium hover:bg-[#005238] transition-colors"
        >
          Create a Menu
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm border-2 border-[#006747] text-[#006747] rounded-lg font-medium hover:bg-[#006747]/5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {refreshing ? "Refreshing..." : "Refresh Likes"}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#006747]/20">
              <th className="text-left py-3 px-4 font-semibold text-[#006747]">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#006747]">
                Honoree
              </th>
              {(["x", "instagram", "tiktok", "facebook"] as Platform[]).map(
                (p) => (
                  <th
                    key={p}
                    className="text-center py-3 px-4 font-semibold text-[#006747]"
                  >
                    {PLATFORM_LABELS[p]}
                  </th>
                )
              )}
              <th className="text-center py-3 px-4 font-semibold text-[#006747]">
                Total
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#006747]">
                Menu
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const rank = i + 1;
              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-100 ${rank <= 3 ? RANK_STYLES[rank] : ""}`}
                >
                  <td className="py-3 px-4 font-bold">
                    {RANK_EMOJI[rank] ?? rank}
                  </td>
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {entry.honoree}
                  </td>
                  {(["x", "instagram", "tiktok", "facebook"] as Platform[]).map(
                    (p) => {
                      const likes = getPlatformLikes(entry, p);
                      return (
                        <td key={p} className="text-center py-3 px-4">
                          {likes !== null ? likes.toLocaleString() : "-"}
                        </td>
                      );
                    }
                  )}
                  <td className="text-center py-3 px-4 font-bold">
                    {entry.totalLikes.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    <a
                      href={`/m/${entry.menuData}`}
                      className="text-[#006747] underline hover:text-[#005238]"
                    >
                      View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {entries.map((entry, i) => {
          const rank = i + 1;
          return (
            <div
              key={entry.id}
              className={`rounded-lg border p-4 ${rank <= 3 ? RANK_STYLES[rank] : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">
                  {RANK_EMOJI[rank] ?? `#${rank}`}
                </span>
                <span className="font-bold text-lg">
                  {entry.totalLikes.toLocaleString()} likes
                </span>
              </div>
              <p
                className="font-medium text-base mb-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {entry.honoree}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {entry.socialPosts.map((post) => (
                  <span
                    key={post.url}
                    className="text-xs bg-white/60 rounded px-2 py-0.5"
                  >
                    {PLATFORM_LABELS[post.platform]}:{" "}
                    {post.likeCount !== null
                      ? post.likeCount.toLocaleString()
                      : "N/A"}
                  </span>
                ))}
              </div>
              <a
                href={`/m/${entry.menuData}`}
                className="text-sm text-[#006747] underline"
              >
                View Menu
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
