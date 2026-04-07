"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import MenuCard from "@/components/MenuCard";
import SiteHeader from "@/components/SiteHeader";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ShareModal";
import MenuGrid from "@/components/MenuGrid";
import { decodeMenu } from "@/lib/url-encoding";
import { ensureShortUrl } from "@/lib/short-url";

interface Props {
  encoded: string;
  menuId?: string | null;
  initialLikeCount?: number;
  themeId?: string | null;
}

export default function MenuViewClient({
  encoded,
  menuId: initialMenuId = null,
  initialLikeCount = 0,
  themeId = null,
}: Props) {
  const menu = encoded ? decodeMenu(encoded) : null;
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(initialMenuId);

  const handleResolveId = useCallback(async (): Promise<string> => {
    if (resolvedId) return resolvedId;
    if (!menu) throw new Error("no menu");
    const { id } = await ensureShortUrl(menu, themeId);
    setResolvedId(id);
    return id;
  }, [resolvedId, menu, themeId]);

  if (!menu) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#006747] mb-2">
              Menu Not Found
            </h1>
            <p className="text-gray-600">
              This link may be invalid or expired.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2 bg-[#006747] text-white rounded-lg"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />

      <main className="w-full max-w-3xl mx-auto py-6 px-4 flex-1">
        {/* Action row above the card */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006747] text-white rounded-lg font-medium text-sm hover:bg-[#005238] transition-colors shadow-sm"
          >
            ← Create Your Own
          </Link>
          <div className="flex items-center gap-2">
            <LikeButton
              menuId={resolvedId}
              initialCount={initialLikeCount}
              onResolveId={handleResolveId}
            />
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label="Share menu"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-[#006747] text-[#006747] bg-white hover:bg-[#006747]/5 transition-colors cursor-pointer text-sm font-semibold"
            >
              <span aria-hidden>↗</span> Share
            </button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow-xl">
          <MenuCard ref={cardRef} menu={menu} />
        </div>

        {/* More popular menus strip */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold text-[#006747]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              More Popular Menus
            </h2>
            <Link
              href="/leaderboard"
              className="text-sm text-[#006747] hover:underline"
            >
              See all →
            </Link>
          </div>
          <MenuGrid
            variant="strip"
            query={{
              sort: "popular",
              limit: 8,
              exclude: resolvedId ?? undefined,
            }}
            emptyMessage="Be the first to share a menu!"
          />
        </section>
      </main>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        menu={menu}
        cardRef={cardRef}
        themeId={themeId}
      />
    </div>
  );
}
