"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import MenuGrid from "@/components/MenuGrid";
import { THEMES, type ThemeId } from "@/lib/ai/themes";

type SortMode = "popular" | "recent";

export default function LeaderboardClient() {
  const search = useSearchParams();
  const initialTheme = search?.get("theme") ?? "all";

  const [theme, setTheme] = useState<string>(initialTheme);
  const [sort, setSort] = useState<SortMode>("popular");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const query = useMemo(
    () => ({
      theme: theme === "all" ? null : (theme as ThemeId),
      sort,
      limit: 60,
      search: debouncedSearch || undefined,
    }),
    [theme, sort, debouncedSearch]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader showPopularLink={false} />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-bold text-[#006747]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Popular Menus
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse and like menus from across the community.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => setTheme("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                theme === "all"
                  ? "bg-[#006747] text-white border-[#006747]"
                  : "bg-white text-[#006747] border-[#006747]/30 hover:border-[#006747]"
              }`}
            >
              All
            </button>
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  theme === t.id
                    ? "bg-[#006747] text-white border-[#006747]"
                    : "bg-white text-[#006747] border-[#006747]/30 hover:border-[#006747]"
                }`}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex rounded-lg border border-[#006747]/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setSort("popular")}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  sort === "popular"
                    ? "bg-[#006747] text-white"
                    : "bg-white text-[#006747]"
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => setSort("recent")}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  sort === "recent"
                    ? "bg-[#006747] text-white"
                    : "bg-white text-[#006747]"
                }`}
              >
                Recent
              </button>
            </div>
            <input
              type="search"
              placeholder="Search by honoree…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="px-3 py-1.5 text-sm border border-[#006747]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]/30 focus:border-[#006747]"
            />
          </div>
        </div>

        <MenuGrid
          query={query}
          emptyMessage="No menus match those filters yet. Be the first!"
        />
      </main>
    </div>
  );
}
