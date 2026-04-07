"use client";

import { useState } from "react";
import { ROASTABLE_GOLFERS } from "@/lib/ai/golfers";

interface Props {
  value: string;
  onChange: (name: string) => void;
}

export default function GolferPicker({ value, onChange }: Props) {
  // Dropdown is shown by default so users can see the curated list at a
  // glance. Picking or matching a single name (and blurring) hides it.
  const [hidden, setHidden] = useState(false);

  const filtered = value
    ? ROASTABLE_GOLFERS.filter((g) =>
        g.name.toLowerCase().includes(value.toLowerCase())
      )
    : ROASTABLE_GOLFERS;

  return (
    <div className="space-y-2">
      <label
        htmlFor="golfer-name"
        className="text-xs uppercase tracking-wider text-gray-500 font-semibold block"
      >
        Pick a golfer (or type any name)
      </label>
      <input
        id="golfer-name"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHidden(false);
        }}
        onFocus={() => setHidden(false)}
        placeholder="Tiger Woods, John Daly, …"
        autoComplete="off"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006747]/30 focus:border-[#006747]"
      />
      {!hidden && filtered.length > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto bg-white">
          {filtered.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => {
                onChange(g.name);
                setHidden(true);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#006747]/5 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-semibold text-[#006747]">
                {g.name}
              </div>
              <div className="text-xs text-gray-500 italic">{g.hint}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
