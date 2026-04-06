import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const honoree = searchParams.get("name") || "Your Name";
  const date = searchParams.get("date") || "April 7, 2026";

  // Decode full menu data if provided
  let menu = null;
  const encoded = searchParams.get("d");
  if (encoded) {
    try {
      const { decompressFromEncodedURIComponent } = await import("lz-string");
      const json = decompressFromEncodedURIComponent(encoded);
      if (json) menu = JSON.parse(json);
    } catch {
      // Fall through to defaults
    }
  }

  const GREEN = "#006747";

  const appetizers = menu?.appetizers || [
    { name: "Peach & Ricotta Flatbread", description: "Balsamic, Hot Honey, Basil" },
    { name: "Rock Shrimp Tempura", description: "Creamy Spicy Sauce" },
    { name: "Bacon-Wrapped Dates", description: "Goat Cheese, Almonds" },
    { name: "Grilled Elk Sliders", description: "Caramelized Onion Jam" },
  ];
  const firstCourse = menu?.firstCourse || { name: "Yellowfin Tuna Carpaccio", description: "Foie Gras, Toasted Baguette, Chives" };
  const mainCourses = menu?.mainCourses || [
    { name: "Wagyu Filet Mignon", description: "" },
    { name: "Seared Salmon", description: "" },
  ];
  const dessert = menu?.dessert || { name: "Sticky Toffee Pudding", description: "Vanilla Ice Cream & Warm Toffee Sauce" };
  const menuHonoree = menu?.honoree || honoree;
  const menuDate = menu?.date || date;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8c8d4 0%, #e890a8 50%, #d4789a 100%)",
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
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
            Masters Club Dinner
          </div>
          <div style={{ fontSize: "12px", marginBottom: "16px" }}>
            {menuDate}
          </div>

          <div style={{ fontSize: "16px", fontWeight: 700, fontStyle: "italic", marginBottom: "8px" }}>
            Appetizers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 32px", marginBottom: "12px" }}>
            {appetizers.map((app: { name: string; description: string }, i: number) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "240px" }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{app.name}</div>
                <div style={{ fontStyle: "italic", fontSize: "11px", opacity: 0.8 }}>{app.description}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "16px", fontWeight: 700, fontStyle: "italic", marginBottom: "4px" }}>
            First Course
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>{firstCourse.name}</div>
          <div style={{ fontStyle: "italic", fontSize: "11px", opacity: 0.8, marginBottom: "12px" }}>
            {firstCourse.description}
          </div>

          <div style={{ fontSize: "16px", fontWeight: 700, fontStyle: "italic", marginBottom: "4px" }}>
            Main Course
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>
            {mainCourses.map((mc: { name: string }) => mc.name).join(" or ")}
          </div>
          <div style={{ fontStyle: "italic", fontSize: "11px", opacity: 0.8, marginBottom: "12px" }}>
            Choice of
          </div>

          <div style={{ fontSize: "16px", fontWeight: 700, fontStyle: "italic", marginBottom: "4px" }}>
            Dessert
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>{dessert.name}</div>
          <div style={{ fontStyle: "italic", fontSize: "11px", opacity: 0.8, marginBottom: "16px" }}>
            {dessert.description}
          </div>

          <div style={{ fontStyle: "italic", fontSize: "16px", fontWeight: 700, marginTop: "auto" }}>
            Served in Honor of {menuHonoree}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
