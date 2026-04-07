"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMenuState } from "@/hooks/useMenuState";
import InlineMenu from "@/components/InlineMenu";
import LandingHero from "@/components/LandingHero";
import GuidedEditBar from "@/components/GuidedEditBar";
import ShareModal from "@/components/ShareModal";
import AiGenerateModal from "@/components/ai/AiGenerateModal";
import InspireMeButton from "@/components/ai/InspireMeButton";
import { STEPS, TOTAL_STEPS, type StepGroupId } from "@/lib/menu-steps";
import type { ThemeId } from "@/lib/ai/themes";
import type { MenuData, Dish } from "@/lib/menu-data";
import type { FieldKind } from "@/lib/ai/prompts";

type Phase = "landing" | "editing" | "done";

interface FieldDescriptor {
  kind: FieldKind;
  index?: number;
}

/**
 * Map a step group id to the AI-field kind + index. Returns null for steps
 * where AI generation doesn't make sense (currently just `date`).
 */
function stepIdToField(id: StepGroupId): FieldDescriptor | null {
  if (id === "honoree") return null;
  if (id === "first-course") return { kind: "first-course" };
  if (id === "dessert") return { kind: "dessert" };
  if (id.startsWith("appetizer-")) {
    return { kind: "appetizer", index: Number(id.split("-")[1]) };
  }
  if (id.startsWith("main-course-")) {
    return { kind: "main-course", index: Number(id.split("-")[2]) };
  }
  if (id.startsWith("beverage-")) {
    return { kind: "beverage", index: Number(id.split("-")[1]) };
  }
  return null;
}

export default function Home() {
  const {
    menu,
    setMenu,
    updateField,
    updateAppetizer,
    updateMainCourse,
    updateWine,
  } = useMenuState();
  const cardRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("landing");
  const [stepIndex, setStepIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId | null>(null);
  const [themeFreeform, setThemeFreeform] = useState("");

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

  const handleOpenAi = useCallback(() => {
    setAiModalOpen(true);
  }, []);

  const handleCloseAi = useCallback(() => {
    setAiModalOpen(false);
  }, []);

  const handleAiGenerated = useCallback(
    (
      generated: MenuData,
      context: { themeId: ThemeId | null; freeform: string }
    ) => {
      setMenu(generated);
      setThemeId(context.themeId);
      setThemeFreeform(context.freeform);
      setAiModalOpen(false);
      setStepIndex(0);
      // Skip the walkthrough — the menu is already complete. Drop the user
      // on the done page so they can read it first; the share modal stays
      // closed until they click "Share Menu" themselves.
      setPhase("done");
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [setMenu]
  );

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

  // Accept an AI suggestion for the current field
  const handleInspireAccept = useCallback(
    (suggestion: { name: string; description: string }) => {
      const field = stepIdToField(currentStep.id);
      if (!field) return;
      switch (field.kind) {
        case "appetizer": {
          const i = field.index ?? 0;
          updateAppetizer(i, suggestion as Dish);
          break;
        }
        case "main-course": {
          const i = field.index ?? 0;
          updateMainCourse(i, suggestion as Dish);
          break;
        }
        case "first-course":
          updateField("firstCourse", suggestion as Dish);
          break;
        case "dessert":
          updateField("dessert", suggestion as Dish);
          break;
        case "beverage": {
          const i = field.index ?? 0;
          updateWine(i, suggestion.name);
          break;
        }
        case "date":
          // Date isn't a step anymore; this case is unreachable from the
          // walkthrough but kept here for type completeness.
          break;
      }
    },
    [
      currentStep,
      updateAppetizer,
      updateMainCourse,
      updateField,
      updateWine,
    ]
  );

  // Build the inspire-me slot for the current step
  const inspireSlot = useMemo(() => {
    if (phase !== "editing") return null;
    const field = stepIdToField(currentStep.id);
    if (!field) return null;
    return (
      <InspireMeButton
        key={currentStep.id /* reset popover state when step changes */}
        honoree={menu.honoree}
        themeId={themeId}
        freeform={themeFreeform}
        field={field}
        currentMenu={menu}
        onAccept={handleInspireAccept}
      />
    );
  }, [
    phase,
    currentStep.id,
    menu,
    themeId,
    themeFreeform,
    handleInspireAccept,
  ]);

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
              Masters Club Champions Menu Builder
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

      {phase === "landing" && (
        <LandingHero onStart={startEditing} onGenerateAi={handleOpenAi} />
      )}

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
          inspireSlot={inspireSlot}
        />
      )}

      <ShareModal
        open={shareOpen}
        onClose={handleCloseShare}
        menu={menu}
        cardRef={cardRef}
      />

      <AiGenerateModal
        open={aiModalOpen}
        onClose={handleCloseAi}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
}
