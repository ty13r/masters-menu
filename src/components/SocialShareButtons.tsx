"use client";

import { useCallback, useState } from "react";
import { toPng } from "html-to-image";
import type { MenuData } from "@/lib/menu-data";
import { encodeMenu } from "@/lib/url-encoding";
import {
  getTwitterShareUrl,
  getFacebookShareUrl,
  getInstagramCopyText,
  getTikTokCopyText,
} from "@/lib/social-share";
import type { Platform } from "@/lib/leaderboard-types";

interface Props {
  menu: MenuData;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  x: "bg-black text-white",
  facebook: "bg-[#1877F2] text-white",
  instagram:
    "bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white",
  tiktok: "bg-black text-white",
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<Platform, React.FC> = {
  x: XIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

export default function SocialShareButtons({ menu, cardRef }: Props) {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [postUrl, setPostUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sharingPlatform, setSharingPlatform] = useState<Platform | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const createShortUrl = useCallback(async () => {
    const encoded = encodeMenu(menu);
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuData: encoded, honoree: menu.honoree }),
    });
    if (!res.ok) throw new Error("Failed to create short URL");
    const data = (await res.json()) as { id: string; url: string };
    setMenuId(data.id);
    return { id: data.id, url: `${window.location.origin}${data.url}` };
  }, [menu]);

  const downloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true;
        return node.dataset.editOnly !== "true";
      },
    });
    const link = document.createElement("a");
    link.download = `masters-dinner-${menu.honoree.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  }, [cardRef, menu.honoree]);

  const downloadOgImage = useCallback(
    async (id: string, format: "square" | "story") => {
      const res = await fetch(`/api/og?id=${id}&format=${format}`);
      if (!res.ok) throw new Error("Failed to fetch OG image");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `masters-dinner-${menu.honoree.replace(/\s+/g, "-").toLowerCase()}-${format}.png`;
      link.href = objectUrl;
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    },
    [menu.honoree]
  );

  const handleShare = useCallback(
    async (platform: Platform) => {
      setSharingPlatform(platform);
      setPostUrl("");
      setSubmitted(false);
      setError("");

      let id: string;
      let menuUrl: string;
      try {
        const created = await createShortUrl();
        id = created.id;
        menuUrl = created.url;
      } catch {
        setError("Couldn't create a share link. Please try again.");
        setSharingPlatform(null);
        return;
      }

      setActivePlatform(platform);

      // Helper: copy with ClipboardItem (Promise-based API that survives
      // awaits on iOS Safari) and fall back to writeText otherwise.
      // Never throws — clipboard failures are non-fatal.
      const tryCopy = async (text: string) => {
        try {
          if (
            typeof ClipboardItem !== "undefined" &&
            navigator.clipboard &&
            "write" in navigator.clipboard
          ) {
            const item = new ClipboardItem({
              "text/plain": new Blob([text], { type: "text/plain" }),
            });
            await navigator.clipboard.write([item]);
            return true;
          }
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          return false;
        }
      };

      try {
        switch (platform) {
          case "x":
            window.open(getTwitterShareUrl(menuUrl, menu.honoree), "_blank");
            break;
          case "facebook":
            window.open(getFacebookShareUrl(menuUrl), "_blank");
            break;
          case "instagram": {
            const igText = getInstagramCopyText(menuUrl, menu.honoree);
            const copied = await tryCopy(igText);
            try {
              await downloadOgImage(id, "square");
            } catch {
              try {
                await downloadPng();
              } catch {
                // fall through — user still has the menu id / link
              }
            }
            if (!copied) {
              setError(
                "Couldn't copy caption to clipboard. You can still paste your post URL below."
              );
            }
            break;
          }
          case "tiktok": {
            const ttText = getTikTokCopyText(menuUrl, menu.honoree);
            const copied = await tryCopy(ttText);
            try {
              await downloadOgImage(id, "story");
            } catch {
              try {
                await downloadPng();
              } catch {
                // fall through
              }
            }
            if (!copied) {
              setError(
                "Couldn't copy caption to clipboard. You can still paste your post URL below."
              );
            }
            break;
          }
        }
      } finally {
        setSharingPlatform(null);
      }
    },
    [createShortUrl, menu.honoree, downloadPng, downloadOgImage]
  );

  const handleSubmitUrl = useCallback(async () => {
    if (!postUrl.trim() || !activePlatform) return;
    setSubmitting(true);
    setError("");

    try {
      // Ensure we have a stored menu id (should already from handleShare)
      let id = menuId;
      if (!id) {
        const created = await createShortUrl();
        id = created.id;
      }

      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          honoree: menu.honoree,
          menuId: id,
          platform: activePlatform,
          postUrl: postUrl.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit");
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        setActivePlatform(null);
        setSubmitted(false);
      }, 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [postUrl, activePlatform, menu.honoree, menuId, createShortUrl]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Share on Social Media
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => {
          const Icon = PLATFORM_ICONS[platform];
          const isLoading = sharingPlatform === platform;
          return (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              disabled={sharingPlatform !== null}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${PLATFORM_COLORS[platform]}`}
            >
              <Icon />
              {isLoading ? "..." : PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>

      {activePlatform && !submitted && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
          {activePlatform === "instagram" || activePlatform === "tiktok" ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#006747]">
                Next steps for {PLATFORM_LABELS[activePlatform]}:
              </p>
              <ol className="text-xs text-gray-700 list-decimal list-inside space-y-0.5">
                <li>Your menu image has been downloaded</li>
                <li>Caption text has been copied to your clipboard</li>
                <li>
                  Open{" "}
                  <a
                    href={
                      activePlatform === "instagram"
                        ? "https://www.instagram.com/"
                        : "https://www.tiktok.com/upload"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#006747]"
                  >
                    {PLATFORM_LABELS[activePlatform]}
                  </a>
                  , upload the image and paste the caption
                </li>
                <li>Paste your post URL below to join the leaderboard</li>
              </ol>
            </div>
          ) : (
            <p className="text-xs text-gray-700">
              After posting, paste your {PLATFORM_LABELS[activePlatform]} post
              URL below to join the leaderboard.
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="url"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder={`Paste your ${PLATFORM_LABELS[activePlatform]} post URL...`}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006747]/30 focus:border-[#006747]"
            />
            <button
              onClick={handleSubmitUrl}
              disabled={submitting || !postUrl.trim()}
              className="px-3 py-1.5 bg-[#006747] text-white text-sm rounded-lg font-medium hover:bg-[#005238] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "..." : "Submit"}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}

      {submitted && (
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-700 font-medium">
            Added to the leaderboard! View rankings on the{" "}
            <a href="/leaderboard" className="underline">
              leaderboard page
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
