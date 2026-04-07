"use client";

import { THEMES, type ThemeId } from "@/lib/ai/themes";

const FREEFORM_EXAMPLES = [
  "Whatever crypto bros would eat",
  "Texas oil money",
  "Vegan Burning Man chef",
  "Dad's 60th, BBQ obsession",
];

interface Props {
  selectedThemeId: ThemeId | null;
  freeform: string;
  onChange: (next: { themeId: ThemeId | null; freeform: string }) => void;
  showFreeform?: boolean;
}

export default function ThemePicker({
  selectedThemeId,
  freeform,
  onChange,
  showFreeform = true,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
          Pick a vibe
        </p>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() =>
                  onChange({
                    themeId: isSelected ? null : theme.id,
                    freeform,
                  })
                }
                className={`theme-chip ${isSelected ? "selected" : ""}`}
                title={theme.shortDescription}
              >
                <span className="text-base leading-none">{theme.emoji}</span>
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {showFreeform && (
        <div>
          <label
            htmlFor="ai-freeform"
            className="text-xs uppercase tracking-wider text-gray-500 font-semibold block mb-1"
          >
            Or describe your own vibe (optional)
          </label>
          <input
            id="ai-freeform"
            type="text"
            value={freeform}
            onFocus={() => {
              if (selectedThemeId !== null) {
                onChange({ themeId: null, freeform });
              }
            }}
            onChange={(e) =>
              onChange({ themeId: null, freeform: e.target.value })
            }
            placeholder='e.g. "Whatever crypto bros would eat"'
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006747]/30 focus:border-[#006747]"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
              Try:
            </span>
            {FREEFORM_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => onChange({ themeId: null, freeform: ex })}
                className="freeform-example-chip"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
