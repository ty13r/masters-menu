"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { MenuData } from "@/lib/menu-data";
import { ensureShortUrl } from "@/lib/short-url";

interface Props {
  open: boolean;
  onClose: () => void;
  menu: MenuData;
  cardRef: React.RefObject<HTMLDivElement | null>;
  themeId?: string | null;
}

async function renderCardBlob(
  el: HTMLElement
): Promise<{ blob: Blob; dataUrl: string }> {
  const dataUrl = await toPng(el, {
    pixelRatio: 2,
    cacheBust: true,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return node.dataset.editOnly !== "true";
    },
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return { blob, dataUrl };
}

export default function ShareModal({
  open,
  onClose,
  menu,
  cardRef,
  themeId,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyingLink, setCopyingLink] = useState(false);
  const [copyingPng, setCopyingPng] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pngCopied, setPngCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { dataUrl } = await renderCardBlob(cardRef.current);
      const link = document.createElement("a");
      link.download = `masters-dinner-${menu.honoree
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      setShowHint(true);
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setDownloading(false);
    }
  }, [cardRef, menu.honoree]);

  const handleCopyPng = useCallback(async () => {
    if (!cardRef.current) return;
    setCopyingPng(true);
    try {
      const { blob } = await renderCardBlob(cardRef.current);
      if (
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard?.write
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setPngCopied(true);
        setTimeout(() => setPngCopied(false), 2000);
        setShowHint(true);
      } else {
        // Fallback: download instead
        await handleDownload();
      }
    } catch (err) {
      console.error("Failed to copy image:", err);
    } finally {
      setCopyingPng(false);
    }
  }, [cardRef, handleDownload]);

  const handleCopyLink = useCallback(async () => {
    setCopyingLink(true);
    try {
      const { url } = await ensureShortUrl(menu, themeId ?? null);
      await navigator.clipboard.writeText(url);
      setTimeout(() => setCopyingLink(false), 2000);
      setShowHint(true);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setCopyingLink(false);
    }
  }, [menu, themeId]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) dialogRef.current?.close();
    },
    []
  );

  const popularUrl = themeId
    ? `/leaderboard?theme=${themeId}`
    : "/leaderboard";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      className="share-modal rounded-2xl shadow-2xl p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="bg-white p-6 sm:p-8 max-w-md w-full">
        <div className="flex items-start justify-between mb-5">
          <h2
            className="text-2xl font-bold text-[#006747]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Share Your Menu
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1 -mt-1 -mr-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={handleCopyPng}
            disabled={copyingPng}
            className="flex-1 px-4 py-2.5 bg-[#006747] text-white rounded-lg font-medium text-sm hover:bg-[#005238] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {copyingPng ? "Copying..." : pngCopied ? "Copied!" : "Copy PNG"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-2.5 border-2 border-[#006747] text-[#006747] rounded-lg font-medium text-sm hover:bg-[#006747]/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {downloading ? "Generating..." : "Download PNG"}
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-2.5 border-2 border-[#006747] text-[#006747] rounded-lg font-medium text-sm hover:bg-[#006747]/5 transition-colors cursor-pointer"
        >
          {copyingLink ? "Copied!" : "Copy Link"}
        </button>

        {showHint && (
          <p className="mt-4 text-xs text-gray-600 text-center">
            Now climb the{" "}
            <a
              href={popularUrl}
              className="text-[#006747] underline font-medium"
            >
              Popular Menus list →
            </a>
          </p>
        )}
      </div>
    </dialog>
  );
}
