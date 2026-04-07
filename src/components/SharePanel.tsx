"use client";

import { useCallback, useState } from "react";
import { toPng } from "html-to-image";
import type { MenuData } from "@/lib/menu-data";
import { encodeMenu } from "@/lib/url-encoding";
import SocialShareButtons from "./SocialShareButtons";

interface Props {
  menu: MenuData;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function SharePanel({ menu, cardRef }: Props) {
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
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
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  }, [cardRef, menu.honoree]);

  const handleCopyLink = useCallback(async () => {
    const encoded = encodeMenu(menu);
    const url = `${window.location.origin}/menu?d=${encoded}`;

    if (url.length > 2000) {
      alert(
        "Your menu is quite long! The share link may not work on all platforms. Consider shortening some descriptions."
      );
    }

    await navigator.clipboard.writeText(url);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }, [menu]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-5 py-2.5 bg-[#006747] text-white rounded-lg font-medium text-sm hover:bg-[#005238] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {downloading ? "Generating..." : "Download PNG"}
        </button>
        <button
          onClick={handleCopyLink}
          className="px-5 py-2.5 border-2 border-[#006747] text-[#006747] rounded-lg font-medium text-sm hover:bg-[#006747]/5 transition-colors cursor-pointer"
        >
          {copying ? "Copied!" : "Copy Share Link"}
        </button>
      </div>
      <SocialShareButtons menu={menu} cardRef={cardRef} />
    </div>
  );
}
