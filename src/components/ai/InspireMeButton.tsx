"use client";

import { useCallback, useState } from "react";
import type { MenuData } from "@/lib/menu-data";
import type { ThemeId } from "@/lib/ai/themes";
import type { FieldKind } from "@/lib/ai/prompts";

interface Props {
  honoree: string;
  themeId: ThemeId | null;
  freeform: string;
  field: { kind: FieldKind; index?: number };
  currentMenu: MenuData;
  onAccept: (suggestion: { name: string; description: string }) => void;
  onClose?: () => void;
}

const TONE_TWEAKS = [
  { label: "More posh", value: "make it more elegant and refined" },
  { label: "Funnier", value: "make it punchier and funnier" },
  { label: "Shorter", value: "use the shortest possible name and description" },
  { label: "Spicier", value: "lean harder into the theme — make it bold" },
];

export default function InspireMeButton({
  honoree,
  themeId,
  freeform,
  field,
  currentMenu,
  onAccept,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [rejected, setRejected] = useState<
    Array<{ name: string; description: string }>
  >([]);
  const [activeTweak, setActiveTweak] = useState<string | null>(null);
  const [error, setError] = useState("");

  const closePopover = useCallback(() => {
    setOpen(false);
    setSuggestion(null);
    setRejected([]);
    setActiveTweak(null);
    setError("");
    onClose?.();
  }, [onClose]);

  const fetchSuggestion = useCallback(
    async (
      rejectedList: Array<{ name: string; description: string }>,
      tweak: string | null
    ) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/ai/suggest-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            honoree,
            themeId: themeId ?? "posh",
            freeform: freeform || undefined,
            field,
            currentMenu,
            rejectedSuggestions: rejectedList.length ? rejectedList : undefined,
            toneTweak: tweak || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't generate a suggestion.");
          return;
        }
        setSuggestion(data.suggestion);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [honoree, themeId, freeform, field, currentMenu]
  );

  const handleOpen = useCallback(() => {
    setOpen(true);
    setSuggestion(null);
    setRejected([]);
    setActiveTweak(null);
    void fetchSuggestion([], null);
  }, [fetchSuggestion]);

  const handleReroll = useCallback(() => {
    if (suggestion) {
      const newRejected = [...rejected, suggestion];
      setRejected(newRejected);
      setSuggestion(null);
      void fetchSuggestion(newRejected, activeTweak);
    }
  }, [suggestion, rejected, activeTweak, fetchSuggestion]);

  const handleAccept = useCallback(() => {
    if (suggestion) {
      onAccept(suggestion);
      closePopover();
    }
  }, [suggestion, onAccept, closePopover]);

  const handleTweak = useCallback(
    (tweak: string) => {
      setActiveTweak(tweak);
      setSuggestion(null);
      void fetchSuggestion(rejected, tweak);
    },
    [rejected, fetchSuggestion]
  );

  return (
    <div className="inspire-anchor">
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="inspire-button"
          title="Generate a suggestion for this field"
        >
          ✨ Inspire me
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={closePopover}
            className="inspire-button"
          >
            ✨ Inspire me
          </button>
          <div className="inspire-popover">
      <div className="inspire-popover-header">
        <span className="text-xs font-semibold text-[#006747]">
          ✨ AI Suggestion
        </span>
        <button
          type="button"
          onClick={closePopover}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-700 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-center text-sm text-gray-500">
          Thinking
          <span className="ai-loader-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      ) : error ? (
        <div className="py-2 text-sm text-red-600">{error}</div>
      ) : suggestion ? (
        <>
          <div className="py-2">
            <div className="font-bold text-[#006747] text-sm">
              {suggestion.name}
            </div>
            {suggestion.description && (
              <div className="italic text-xs text-gray-600 mt-0.5">
                {suggestion.description}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 my-2">
            {TONE_TWEAKS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => handleTweak(t.value)}
                className={`tone-tweak-chip ${
                  activeTweak === t.value ? "selected" : ""
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleReroll}
              className="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              🎲 Reroll
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#006747] text-white rounded-lg hover:bg-[#005238] cursor-pointer"
            >
              ✓ Accept
            </button>
          </div>
        </>
      ) : null}
          </div>
        </>
      )}
    </div>
  );
}
