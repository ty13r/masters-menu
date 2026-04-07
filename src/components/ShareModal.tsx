"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { MenuData } from "@/lib/menu-data";
import { encodeMenu } from "@/lib/url-encoding";
import SocialShareButtons from "./SocialShareButtons";

interface Props {
  open: boolean;
  onClose: () => void;
  menu: MenuData;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function ShareModal({ open, onClose, menu, cardRef }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sync the dialog open state with the prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Catch native close (Escape key, backdrop click) and propagate
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
        "Your menu is quite long! The share link may not work on all platforms."
      );
    }
    await navigator.clipboard.writeText(url);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  }, [menu]);

  // Close on backdrop click
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        dialogRef.current?.close();
      }
    },
    []
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      className="share-modal rounded-2xl shadow-2xl p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="bg-white p-6 sm:p-8 max-w-md w-full">
        <div className="flex items-start justify-between mb-1">
          <h2
            className="text-2xl font-bold text-[#006747]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Your Menu Is Ready!
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
        <p className="text-sm text-gray-600 mb-5">
          Share it with friends and join the leaderboard.
        </p>

        <div className="flex gap-2 mb-5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-2.5 bg-[#006747] text-white rounded-lg font-medium text-sm hover:bg-[#005238] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {downloading ? "Generating..." : "Download PNG"}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 px-4 py-2.5 border-2 border-[#006747] text-[#006747] rounded-lg font-medium text-sm hover:bg-[#006747]/5 transition-colors cursor-pointer"
          >
            {copying ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <SocialShareButtons menu={menu} cardRef={cardRef} />
      </div>
    </dialog>
  );
}
