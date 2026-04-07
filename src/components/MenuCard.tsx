import React, { forwardRef } from "react";
import type { MenuData } from "@/lib/menu-data";

const GREEN = "#006747";

interface Props {
  menu: MenuData;
}

const MenuCard = forwardRef<HTMLDivElement, Props>(({ menu }, ref) => {
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
        <p
          style={{
            fontSize: "14px",
            margin: "0 0 28px",
          }}
        >
          {menu.date}
        </p>

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
          {menu.appetizers.map((app, i) => (
            <DishItem key={i} dish={app} />
          ))}
        </div>

        {/* First Course */}
        <SectionHeader>First Course</SectionHeader>
        <DishItem dish={menu.firstCourse} />
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
          {menu.mainCourses.map((mc) => mc.name).join(" or ")}
        </p>
        {menu.mainCourses.map((mc, i) => (
          <p
            key={i}
            style={{
              fontStyle: "italic",
              fontSize: "14px",
              margin: "0 0 2px",
              opacity: 0.85,
            }}
          >
            {mc.description}
          </p>
        ))}
        <Spacer />

        {/* Dessert */}
        <SectionHeader>Dessert</SectionHeader>
        <DishItem dish={menu.dessert} />
        <Spacer />

        {/* Beverage Pairings */}
        <div style={{ marginBottom: "24px" }}>
          {menu.wines.map((wine, i) => (
            <p
              key={i}
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                margin: "0 0 2px",
                opacity: 0.8,
              }}
            >
              {wine}
            </p>
          ))}
        </div>

        {/* Ornament */}
        <div
          style={{
            fontSize: "18px",
            margin: "0 0 16px",
            opacity: 0.6,
          }}
        >
          ❧
        </div>

        {/* Footer */}
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "18px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Served in Honor of {menu.honoree}
        </p>
      </div>
    </div>
  );
});

MenuCard.displayName = "MenuCard";
export default MenuCard;

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

function DishItem({ dish }: { dish: { name: string; description: string } }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <p style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 2px" }}>
        {dish.name}
      </p>
      <p
        style={{
          fontStyle: "italic",
          fontSize: "13px",
          margin: 0,
          opacity: 0.85,
        }}
      >
        {dish.description}
      </p>
    </div>
  );
}

function Spacer() {
  return <div style={{ height: "20px" }} />;
}
