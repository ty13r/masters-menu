import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { decodeMenu } from "@/lib/url-encoding";
import { defaultMenu, type MenuData } from "@/lib/menu-data";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.url
    ? new URL(request.url)
    : { searchParams: new URLSearchParams() };
  const encoded = searchParams.get("d");
  const menu: MenuData = encoded ? decodeMenu(encoded) ?? defaultMenu : defaultMenu;

  const playfairData = await fetch(
    new URL("/fonts/PlayfairDisplay-BoldItalic.ttf", request.url)
  ).then((res) => res.arrayBuffer());

  const loraData = await fetch(
    new URL("/fonts/Lora-Regular.ttf", request.url)
  ).then((res) => res.arrayBuffer());

  const GREEN = "#006747";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, #f8c8d4, #e890a8, #d4789a)",
          padding: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#FAF8F0",
            padding: "30px 40px",
            width: "100%",
            height: "100%",
            color: GREEN,
            fontFamily: "Lora",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Masters Club Dinner
          </div>
          <div style={{ fontSize: "12px", marginBottom: "16px" }}>
            {menu.date}
          </div>

          {/* Appetizers */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "16px",
              fontWeight: 700,
              fontStyle: "italic",
              marginBottom: "8px",
            }}
          >
            Appetizers
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px 32px",
              marginBottom: "12px",
            }}
          >
            {menu.appetizers.map((app, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "240px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "14px" }}>
                  {app.name}
                </div>
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: "11px",
                    opacity: 0.8,
                  }}
                >
                  {app.description}
                </div>
              </div>
            ))}
          </div>

          {/* First Course */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "16px",
              fontWeight: 700,
              fontStyle: "italic",
              marginBottom: "4px",
            }}
          >
            First Course
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>
            {menu.firstCourse.name}
          </div>
          <div
            style={{
              fontStyle: "italic",
              fontSize: "11px",
              opacity: 0.8,
              marginBottom: "12px",
            }}
          >
            {menu.firstCourse.description}
          </div>

          {/* Main Course */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "16px",
              fontWeight: 700,
              fontStyle: "italic",
              marginBottom: "4px",
            }}
          >
            Main Course
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>
            {menu.mainCourses.map((mc) => mc.name).join(" or ")}
          </div>
          <div
            style={{
              fontStyle: "italic",
              fontSize: "10px",
              opacity: 0.8,
              marginBottom: "12px",
            }}
          >
            {menu.mainCourses.map((mc) => mc.description).join(" | ")}
          </div>

          {/* Dessert */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: "16px",
              fontWeight: 700,
              fontStyle: "italic",
              marginBottom: "4px",
            }}
          >
            Dessert
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>
            {menu.dessert.name}
          </div>
          <div
            style={{
              fontStyle: "italic",
              fontSize: "11px",
              opacity: 0.8,
              marginBottom: "16px",
            }}
          >
            {menu.dessert.description}
          </div>

          {/* Footer */}
          <div
            style={{
              fontFamily: "Playfair Display",
              fontStyle: "italic",
              fontSize: "16px",
              fontWeight: 700,
              marginTop: "auto",
            }}
          >
            Served in Honor of {menu.honoree}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairData,
          style: "italic",
          weight: 700,
        },
        {
          name: "Lora",
          data: loraData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
