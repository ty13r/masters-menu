"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuData } from "@/lib/menu-data";
import type { ThemeId } from "@/lib/ai/themes";
import type { GeneratedMenu } from "@/lib/ai/menu-schema";
import ThemePicker from "./ThemePicker";
import GolferPicker from "./GolferPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerated: (
    menu: MenuData,
    context: { themeId: ThemeId | null; freeform: string }
  ) => void;
}

export default function AiGenerateModal({
  open,
  onClose,
  onGenerated,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [honoree, setHonoree] = useState("");
  const [themeId, setThemeId] = useState<ThemeId | null>("roast-pro");
  const [freeform, setFreeform] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset modal state on open. Honoree always starts empty so users have to
  // think about who they're honoring instead of accepting "Your Name".
  useEffect(() => {
    if (open) {
      setHonoree("");
      setThemeId("roast-pro");
      setFreeform("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  // Sync the dialog open state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Catch native close (Escape, backdrop)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current && !loading) {
        dialogRef.current?.close();
      }
    },
    [loading]
  );

  const handleGenerate = useCallback(async () => {
    if (!honoree.trim()) {
      setError("Add a name (or pick a golfer) to honor first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          honoree: honoree.trim(),
          // Pass themeId as-is (null when the user only typed freeform).
          // The server has a freeform-only prompt mode that's much stronger
          // than letting "posh" silently take over.
          themeId: themeId ?? undefined,
          freeform: freeform.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't generate a menu.");
        setLoading(false);
        return;
      }
      const generated: GeneratedMenu = data.menu;
      const fullMenu: MenuData = {
        honoree: honoree.trim(),
        date: generated.date,
        appetizers: generated.appetizers,
        firstCourse: generated.firstCourse,
        mainCourses: generated.mainCourses,
        dessert: generated.dessert,
        wines: generated.wines,
      };
      onGenerated(fullMenu, { themeId, freeform: freeform.trim() });
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }, [honoree, themeId, freeform, onGenerated]);

  const isRoastPro = themeId === "roast-pro";

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      className="ai-generate-modal rounded-2xl shadow-2xl p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="bg-white p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/augusta-logo.png"
              alt=""
              className="h-16 w-auto mb-4 ai-loader-pulse"
            />
            <h2
              className="text-2xl font-bold text-[#006747] mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Plating your menu
              <span className="ai-loader-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </h2>
            <p className="text-sm text-gray-600 max-w-xs">
              Claude is composing 14 fields in the spirit of {honoree}. Takes
              about 15 seconds.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-1">
              <h2
                className="text-2xl font-bold text-[#006747]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Generate with AI
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
              Pick a vibe and we&apos;ll write your whole menu. You can edit
              every word after.
            </p>

            <div className="space-y-4">
              <ThemePicker
                selectedThemeId={themeId}
                freeform={freeform}
                onChange={(next) => {
                  setThemeId(next.themeId);
                  setFreeform(next.freeform);
                }}
                showFreeform={!isRoastPro}
              />

              {isRoastPro ? (
                <GolferPicker value={honoree} onChange={setHonoree} />
              ) : (
                <div>
                  <label
                    htmlFor="honoree-input"
                    className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1"
                  >
                    Honoring
                  </label>
                  <input
                    id="honoree-input"
                    type="text"
                    value={honoree}
                    onChange={(e) => setHonoree(e.target.value)}
                    placeholder="Aunt Linda, Coach, the Smiths…"
                    maxLength={80}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006747]/30 focus:border-[#006747]"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !honoree.trim()}
                className="w-full px-5 py-3 bg-[#006747] text-white rounded-lg font-semibold text-base hover:bg-[#005238] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                ✨ Generate Menu
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
