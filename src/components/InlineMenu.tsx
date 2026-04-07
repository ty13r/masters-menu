"use client";

import React, { forwardRef, useEffect, useRef } from "react";
import type { MenuData, Dish } from "@/lib/menu-data";
import type { StepGroupId } from "@/lib/menu-steps";
import EditableText, { type EditableTextHandle } from "./EditableText";

const GREEN = "#006747";

interface Props {
  menu: MenuData;
  updateField: <K extends keyof MenuData>(field: K, value: MenuData[K]) => void;
  updateAppetizer: (index: number, dish: Dish) => void;
  updateMainCourse: (index: number, dish: Dish) => void;
  updateWine: (index: number, value: string) => void;
  /** When set, only this group is interactive — others are dimmed. Null = all interactive. */
  activeStepId?: StepGroupId | null;
  /** When false, render fields as plain (non-editable) text */
  editable?: boolean;
}

const InlineMenu = forwardRef<HTMLDivElement, Props>(function InlineMenu(
  {
    menu,
    updateField,
    updateAppetizer,
    updateMainCourse,
    updateWine,
    activeStepId = null,
    editable = true,
  },
  ref
) {
  // Track refs to the FIRST EditableText in each group so we can focus it
  // when the active step changes.
  const firstFieldRefs = useRef<Map<StepGroupId, EditableTextHandle | null>>(
    new Map()
  );

  useEffect(() => {
    if (!activeStepId || !editable) return;
    // Defer focus until after the dim/un-dim transition begins so the
    // browser doesn't reject focus on a pointer-events:none ancestor.
    const handle = firstFieldRefs.current.get(activeStepId);
    requestAnimationFrame(() => handle?.focus());
  }, [activeStepId, editable]);

  const setFirstFieldRef =
    (id: StepGroupId) => (h: EditableTextHandle | null) => {
      firstFieldRefs.current.set(id, h);
    };

  return (
    <div
      ref={ref}
      className="menu-card-wrapper"
      style={{
        backgroundImage: "url('/menu-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "fit-content",
      }}
    >
      <div
        className="menu-card"
        style={{
          background: "#FAF8F0",
          maxWidth: "680px",
          width: "100%",
          padding: "48px 40px",
          fontFamily: "'Lora', serif",
          color: GREEN,
          textAlign: "center",
          position: "relative",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "12px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/augusta-logo.png"
            alt="Augusta National Golf Club"
            style={{ height: "80px", width: "auto", margin: "0 auto" }}
          />
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 4px",
          }}
        >
          Masters Club Dinner
        </h1>

        {/* Date — static, not editable */}
        <p style={{ fontSize: "14px", margin: "0 0 28px" }}>{menu.date}</p>

        {/* Appetizers */}
        <SectionHeader>Appetizers</SectionHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px 32px",
            marginBottom: "24px",
          }}
        >
          {menu.appetizers.map((app, i) => {
            const id = `appetizer-${i}` as StepGroupId;
            return (
              <StepGroup key={i} id={id} activeStepId={activeStepId}>
                <DishField
                  dish={app}
                  onChange={(d) => updateAppetizer(i, d)}
                  namePlaceholder="Add appetizer name"
                  descriptionPlaceholder="Add description"
                  editable={editable}
                  firstFieldRef={setFirstFieldRef(id)}
                />
              </StepGroup>
            );
          })}
        </div>

        <Spacer />

        {/* First Course */}
        <SectionHeader>First Course</SectionHeader>
        <StepGroup id="first-course" activeStepId={activeStepId}>
          <DishField
            dish={menu.firstCourse}
            onChange={(d) => updateField("firstCourse", d)}
            namePlaceholder="Add first course name"
            descriptionPlaceholder="Add description"
            editable={editable}
            firstFieldRef={setFirstFieldRef("first-course")}
          />
        </StepGroup>
        <Spacer />

        {/* Main Course */}
        <SectionHeader>Main Course</SectionHeader>
        <p
          style={{
            fontStyle: "italic",
            fontSize: "14px",
            margin: "0 0 8px",
          }}
        >
          Choice of
        </p>
        <p
          style={{
            fontWeight: 700,
            fontSize: "18px",
            margin: "0 0 6px",
          }}
        >
          {menu.mainCourses.map((mc, i) => {
            const id = `main-course-${i}` as StepGroupId;
            return (
              <span key={i}>
                {i > 0 && " or "}
                <StepGroup id={id} activeStepId={activeStepId} inline>
                  <EditableText
                    ref={setFirstFieldRef(id)}
                    value={mc.name}
                    placeholder={`Main course ${i + 1}`}
                    disabled={!editable}
                    onChange={(v) =>
                      updateMainCourse(i, { ...mc, name: v })
                    }
                    ariaLabel={`Main course ${i + 1} name`}
                  />
                </StepGroup>
              </span>
            );
          })}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          {menu.mainCourses.map((mc, i) => {
            const id = `main-course-${i}` as StepGroupId;
            const isActive = activeStepId === id || activeStepId == null;
            return (
              <p
                key={i}
                style={{
                  fontStyle: "italic",
                  fontSize: "13px",
                  margin: 0,
                  opacity: isActive ? 0.85 : 0.35,
                  transition: "opacity 200ms ease",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <EditableText
                  value={mc.description}
                  placeholder="Add description / sides"
                  disabled={!editable}
                  onChange={(v) =>
                    updateMainCourse(i, { ...mc, description: v })
                  }
                  ariaLabel={`Main course ${i + 1} description`}
                  multiline
                />
              </p>
            );
          })}
        </div>

        <Spacer />

        {/* Dessert */}
        <SectionHeader>Dessert</SectionHeader>
        <StepGroup id="dessert" activeStepId={activeStepId}>
          <DishField
            dish={menu.dessert}
            onChange={(d) => updateField("dessert", d)}
            namePlaceholder="Add dessert name"
            descriptionPlaceholder="Add description"
            editable={editable}
            firstFieldRef={setFirstFieldRef("dessert")}
          />
        </StepGroup>
        <Spacer />

        {/* Beverage Pairings */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginBottom: "24px",
          }}
        >
          {menu.wines.map((wine, i) => {
            const id = `beverage-${i}` as StepGroupId;
            return (
              <StepGroup key={i} id={id} activeStepId={activeStepId}>
                <p
                  style={{
                    fontStyle: "italic",
                    fontSize: "12px",
                    margin: 0,
                    opacity: 0.8,
                  }}
                >
                  <EditableText
                    ref={setFirstFieldRef(id)}
                    value={wine}
                    placeholder="Add beverage pairing"
                    disabled={!editable}
                    onChange={(v) => updateWine(i, v)}
                    ariaLabel={`Beverage ${i + 1}`}
                  />
                </p>
              </StepGroup>
            );
          })}
        </div>

        {/* Ornament */}
        <div
          style={{
            fontSize: "18px",
            margin: "16px 0 16px",
            opacity: 0.6,
          }}
        >
          ❧
        </div>

        {/* Footer / Honoree */}
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "18px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Served in Honor of{" "}
          <StepGroup id="honoree" activeStepId={activeStepId} inline>
            <EditableText
              ref={setFirstFieldRef("honoree")}
              value={menu.honoree}
              placeholder="Add honoree"
              disabled={!editable}
              onChange={(v) => updateField("honoree", v)}
              ariaLabel="Honoree name"
            />
          </StepGroup>
        </p>
      </div>
    </div>
  );
});

export default InlineMenu;

interface StepGroupProps {
  id: StepGroupId;
  activeStepId: StepGroupId | null;
  children: React.ReactNode;
  inline?: boolean;
}

function StepGroup({ id, activeStepId, children, inline }: StepGroupProps) {
  const isActive = activeStepId === id;
  const isUnscoped = activeStepId == null;
  const dim = !isActive && !isUnscoped;

  const style: React.CSSProperties = {
    opacity: dim ? 0.35 : 1,
    transition: "opacity 200ms ease, outline-color 200ms ease",
    pointerEvents: dim ? "none" : "auto",
  };

  if (inline) {
    return (
      <span
        data-step-group={id}
        data-active={isActive ? "true" : undefined}
        style={style}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      data-step-group={id}
      data-active={isActive ? "true" : undefined}
      style={style}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontStyle: "italic",
        fontSize: "20px",
        margin: "0 0 12px",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </h2>
  );
}

function Spacer() {
  return <div style={{ height: "20px" }} />;
}

interface DishFieldProps {
  dish: Dish;
  onChange: (d: Dish) => void;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  editable: boolean;
  firstFieldRef?: (h: EditableTextHandle | null) => void;
}

function DishField({
  dish,
  onChange,
  namePlaceholder,
  descriptionPlaceholder,
  editable,
  firstFieldRef,
}: DishFieldProps) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 2px" }}>
        <EditableText
          ref={firstFieldRef}
          value={dish.name}
          placeholder={namePlaceholder}
          disabled={!editable}
          onChange={(v) => onChange({ ...dish, name: v })}
          ariaLabel={namePlaceholder}
        />
      </p>
      <p
        style={{
          fontStyle: "italic",
          fontSize: "13px",
          margin: 0,
          opacity: 0.85,
        }}
      >
        <EditableText
          value={dish.description}
          placeholder={descriptionPlaceholder}
          disabled={!editable}
          onChange={(v) => onChange({ ...dish, description: v })}
          ariaLabel={descriptionPlaceholder}
          multiline
        />
      </p>
    </div>
  );
}
