"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMenuState } from "@/hooks/useMenuState";
import InlineMenu from "@/components/InlineMenu";
import LandingHero from "@/components/LandingHero";
import GuidedEditBar from "@/components/GuidedEditBar";
import ShareModal from "@/components/ShareModal";
import { STEPS, TOTAL_STEPS } from "@/lib/menu-steps";

type Phase = "landing" | "editing" | "done";

export default function Home() {
  const { menu, updateField, updateAppetizer, updateMainCourse, updateWine } =
    useMenuState();
  const cardRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("landing");
  const [stepIndex, setStepIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const currentStep = STEPS[stepIndex];

  // Auto-scroll the active group into view when the step changes
  useEffect(() => {
    if (phase !== "editing") return;
    const id = currentStep?.id;
    if (!id) return;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-step-group="${id}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }, [phase, currentStep?.id]);

  const startEditing = useCallback(() => {
    setStepIndex(0);
    setPhase("editing");
  }, []);

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleSkip = useCallback(() => {
    setStepIndex((i) => i + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (stepIndex >= TOTAL_STEPS - 1) {
      setPhase("done");
      setShareOpen(true);
      // Scroll to top of menu
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex]);

  const handleEditAgain = useCallback(() => {
    setStepIndex(0);
    setPhase("editing");
  }, []);

  const handleOpenShare = useCallback(() => {
    setShareOpen(true);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#006747] text-white py-4 px-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex-1" />
          <div className="text-center">
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Masters Club Dinner Menu Builder
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <a
              href="/leaderboard"
              className="text-sm text-white/90 hover:text-white underline"
            >
              Leaderboard
            </a>
          </div>
        </div>
      </header>

      {phase === "landing" && <LandingHero onStart={startEditing} />}

      {(phase === "editing" || phase === "done") && (
        <main
          className="max-w-3xl mx-auto px-4 py-8"
          style={{ paddingBottom: phase === "editing" ? "120px" : "32px" }}
        >
          <div className="rounded-lg overflow-hidden shadow-lg">
            <InlineMenu
              ref={cardRef}
              menu={menu}
              updateField={updateField}
              updateAppetizer={updateAppetizer}
              updateMainCourse={updateMainCourse}
              updateWine={updateWine}
              activeStepId={phase === "editing" ? currentStep.id : null}
              editable={phase === "editing"}
            />
          </div>

          {phase === "done" && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleEditAgain}
                className="px-5 py-2.5 border-2 border-[#006747] text-[#006747] rounded-lg font-medium text-sm hover:bg-[#006747]/5 transition-colors cursor-pointer"
              >
                ✎ Edit Menu
              </button>
              <button
                type="button"
                onClick={handleOpenShare}
                className="px-5 py-2.5 bg-[#006747] text-white rounded-lg font-medium text-sm hover:bg-[#005238] transition-colors cursor-pointer shadow-sm"
              >
                Share Menu →
              </button>
            </div>
          )}
        </main>
      )}

      {phase === "editing" && (
        <GuidedEditBar
          currentIndex={stepIndex}
          total={TOTAL_STEPS}
          currentLabel={currentStep.label}
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleNext}
        />
      )}

      <ShareModal
        open={shareOpen}
        onClose={handleCloseShare}
        menu={menu}
        cardRef={cardRef}
      />
    </div>
  );
}
