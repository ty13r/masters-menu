"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { THEMES, type ThemeId, getTheme } from "@/lib/ai/themes";

export interface MenuListItem {
  id: string;
  honoree: string;
  theme: string | null;
  likeCount: number;
  featured?: boolean;
  createdAt: string;
}

interface Props {
  /** If provided, fetches once with these query params and renders. */
  query?: {
    theme?: string | null;
    sort?: "popular" | "recent";
    limit?: number;
    exclude?: string;
    search?: string;
  };
  /** Or pass items directly (server-rendered). */
  items?: MenuListItem[];
  variant?: "grid" | "strip";
  emptyMessage?: string;
}

function themeBadge(themeId: string | null) {
  if (!themeId) return null;
  const t = THEMES.find((x) => x.id === themeId);
  if (!t) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#006747] bg-[#006747]/10 rounded-full px-2 py-0.5">
      <span>{t.emoji}</span>
      <span>{t.label}</span>
    </span>
  );
}

export default function MenuGrid({
  query,
  items: propsItems,
  variant = "grid",
  emptyMessage = "No menus yet.",
}: Props) {
  const [items, setItems] = useState<MenuListItem[] | null>(propsItems ?? null);
  const [loading, setLoading] = useState(!propsItems);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (query.theme) params.set("theme", query.theme);
    if (query.sort) params.set("sort", query.sort);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.exclude) params.set("exclude", query.exclude);
    if (query.search) params.set("q", query.search);
    fetch(`/api/menus?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: MenuListItem[]) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query?.theme, query?.sort, query?.limit, query?.exclude, query?.search]);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {items.map((m) => (
          <Link
            key={m.id}
            href={`/m/${m.id}`}
            className="flex-shrink-0 w-44 snap-start rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-square bg-gray-50 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/og?id=${m.id}&format=square`}
                alt={`${m.honoree}'s menu`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <div
                className="font-bold text-sm text-[#006747] truncate"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {m.honoree}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {getTheme(m.theme as ThemeId | undefined).label}
                </span>
                <span className="text-xs text-[#006747] font-semibold">
                  ♥ {m.likeCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m) => (
        <Link
          key={m.id}
          href={`/m/${m.id}`}
          className="rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow overflow-hidden group"
        >
          <div className="aspect-square bg-gray-50 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/og?id=${m.id}&format=square`}
              alt={`${m.honoree}'s menu`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
              loading="lazy"
            />
            {m.featured && (
              <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>
          <div className="p-3">
            <div
              className="font-bold text-base text-[#006747] truncate"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {m.honoree}
            </div>
            <div className="flex items-center justify-between mt-2">
              {themeBadge(m.theme)}
              <span className="text-sm text-[#006747] font-semibold ml-auto">
                ♥ {m.likeCount}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
