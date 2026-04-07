"use client";

import { useCallback, useEffect, useState } from "react";

interface Props {
  menuId: string | null;
  initialCount?: number;
  /**
   * Called the first time we need a real menuId (e.g., for legacy /menu?d=
   * pages where the short URL hasn't been created yet). Should return the
   * persistent id.
   */
  onResolveId?: () => Promise<string>;
  className?: string;
}

function getClientId(): string {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem("masters-menu-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("masters-menu-client-id", id);
  }
  return id;
}

export default function LikeButton({
  menuId,
  initialCount = 0,
  onResolveId,
  className = "",
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!menuId) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(`liked:${menuId}`)) setLiked(true);
  }, [menuId]);

  const handleLike = useCallback(async () => {
    if (busy || liked) return;
    setBusy(true);
    try {
      let id = menuId;
      if (!id && onResolveId) {
        id = await onResolveId();
      }
      if (!id) return;

      // optimistic
      setCount((c) => c + 1);
      setLiked(true);
      localStorage.setItem(`liked:${id}`, "1");

      const res = await fetch(`/api/menus/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: getClientId() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { liked: boolean; likeCount: number };
        setCount(data.likeCount);
      }
    } catch {
      // swallow — optimistic state is fine
    } finally {
      setBusy(false);
    }
  }, [busy, liked, menuId, onResolveId]);

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={busy || liked}
      aria-label={liked ? "Liked" : "Like this menu"}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 transition-colors cursor-pointer disabled:cursor-default ${
        liked
          ? "bg-[#006747] border-[#006747] text-white"
          : "bg-white border-[#006747] text-[#006747] hover:bg-[#006747]/5"
      } ${className}`}
    >
      <span className="text-base leading-none">{liked ? "♥" : "♡"}</span>
      <span className="text-sm font-semibold tabular-nums">{count}</span>
    </button>
  );
}
