"use client";

import type { ReactNode } from "react";

interface Props {
  currentIndex: number;
  total: number;
  currentLabel: string;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  /** Optional extra content (e.g. an Inspire Me button) shown left of Back. */
  inspireSlot?: ReactNode;
}

export default function GuidedEditBar({
  currentIndex,
  total,
  currentLabel,
  onBack,
  onSkip,
  onNext,
  inspireSlot,
}: Props) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-30">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-[#006747] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-700 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            Step {currentIndex + 1} of {total}
          </div>
          <div
            className="font-semibold text-[#006747] truncate"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {currentLabel}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {inspireSlot}
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="px-3 py-2 text-sm font-medium text-[#006747] rounded-lg hover:bg-[#006747]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="hidden sm:inline px-3 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 text-sm font-semibold bg-[#006747] text-white rounded-lg hover:bg-[#005238] transition-colors cursor-pointer shadow-sm"
          >
            {isLast ? "Finish ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
