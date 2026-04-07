import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getMenu } from "@/lib/menu-storage";

// Use Node.js runtime so we can query Postgres via @vercel/postgres
export const runtime = "nodejs";

type Format = "landscape" | "square" | "story";

interface Dish {
  name: string;
  description: string;
}

interface Menu {
  honoree: string;
  date: string;
  appetizers: Dish[];
  firstCourse: Dish;
  mainCourses: Dish[];
  dessert: Dish;
  wines?: string[];
}

const DEFAULT_MENU: Menu = {
  honoree: "Your Name",
  date: "April 7, 2026",
  appetizers: [
    { name: "Peach & Ricotta Flatbread", description: "Balsamic, Hot Honey, Basil" },
    { name: "Rock Shrimp Tempura", description: "Creamy Spicy Sauce" },
    { name: "Bacon-Wrapped Dates", description: "Goat Cheese, Almonds" },
    { name: "Grilled Elk Sliders", description: "Caramelized Onion Jam" },
  ],
  firstCourse: {
    name: "Yellowfin Tuna Carpaccio",
    description: "Foie Gras, Toasted Baguette, Chives",
  },
  mainCourses: [
    { name: "Wagyu Filet Mignon", description: "" },
    { name: "Seared Salmon", description: "" },
  ],
  dessert: {
    name: "Sticky Toffee Pudding",
    description: "Vanilla Ice Cream & Warm Toffee Sauce",
  },
};

const FORMAT_DIMENSIONS: Record<Format, { width: number; height: number }> = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

const GREEN = "#006747";

async function decodeMenuFromBlob(encoded: string): Promise<Menu | null> {
  try {
    const { decompressFromEncodedURIComponent } = await import("lz-string");
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as Menu;
  } catch {
    return null;
  }
}

async function loadMenu(req: NextRequest): Promise<Menu> {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    const stored = await getMenu(id).catch(() => null);
    if (stored) {
      const decoded = await decodeMenuFromBlob(stored.data);
      if (decoded) return decoded;
    }
  }

  const encoded = searchParams.get("d");
  if (encoded) {
    const decoded = await decodeMenuFromBlob(encoded);
    if (decoded) return decoded;
  }

  // Manual override for honoree/date
  const honoree = searchParams.get("name");
  const date = searchParams.get("date");
  if (honoree || date) {
    return {
      ...DEFAULT_MENU,
      honoree: honoree || DEFAULT_MENU.honoree,
      date: date || DEFAULT_MENU.date,
    };
  }

  return DEFAULT_MENU;
}

function renderLandscape(menu: Menu) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f8c8d4 0%, #e890a8 50%, #d4789a 100%)",
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
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Masters Club Dinner
        </div>
        <div style={{ fontSize: 12, marginBottom: 16 }}>{menu.date}</div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 8,
          }}
        >
          Appetizers
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "4px 32px",
            marginBottom: 12,
          }}
        >
          {menu.appetizers.map((app, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 240,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{app.name}</div>
              <div style={{ fontStyle: "italic", fontSize: 11, opacity: 0.8 }}>
                {app.description}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 4,
          }}
        >
          First Course
        </div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {menu.firstCourse.name}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 11,
            opacity: 0.8,
            marginBottom: 12,
          }}
        >
          {menu.firstCourse.description}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 4,
          }}
        >
          Main Course
        </div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {menu.mainCourses.map((mc) => mc.name).join(" or ")}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 11,
            opacity: 0.8,
            marginBottom: 12,
          }}
        >
          Choice of
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 4,
          }}
        >
          Dessert
        </div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>
          {menu.dessert.name}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 11,
            opacity: 0.8,
            marginBottom: 16,
          }}
        >
          {menu.dessert.description}
        </div>

        <div
          style={{
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 700,
            marginTop: "auto",
          }}
        >
          Served in Honor of {menu.honoree}
        </div>
      </div>
    </div>
  );
}

function renderSquare(menu: Menu) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f8c8d4 0%, #e890a8 50%, #d4789a 100%)",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#FAF8F0",
          padding: "60px 70px",
          width: "100%",
          height: "100%",
          color: GREEN,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, marginBottom: 6 }}>
          Masters Club Dinner
        </div>
        <div style={{ fontSize: 22, marginBottom: 30 }}>{menu.date}</div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 14,
          }}
        >
          Appetizers
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {menu.appetizers.map((app, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 24 }}>{app.name}</div>
              <div style={{ fontStyle: "italic", fontSize: 18, opacity: 0.8 }}>
                {app.description}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          Main Course
        </div>
        <div style={{ fontWeight: 700, fontSize: 24, textAlign: "center" }}>
          {menu.mainCourses.map((mc) => mc.name).join(" or ")}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 18,
            opacity: 0.8,
            marginBottom: 28,
          }}
        >
          Choice of
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          Dessert
        </div>
        <div style={{ fontWeight: 700, fontSize: 24 }}>{menu.dessert.name}</div>
        <div style={{ fontStyle: "italic", fontSize: 18, opacity: 0.8 }}>
          {menu.dessert.description}
        </div>

        <div
          style={{
            fontStyle: "italic",
            fontSize: 26,
            fontWeight: 700,
            marginTop: "auto",
            textAlign: "center",
          }}
        >
          Served in Honor of {menu.honoree}
        </div>
      </div>
    </div>
  );
}

function renderStory(menu: Menu) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f8c8d4 0%, #e890a8 50%, #d4789a 100%)",
        padding: "60px 40px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#FAF8F0",
          padding: "80px 60px",
          width: "100%",
          height: "100%",
          color: GREEN,
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 8 }}>
          Masters Club Dinner
        </div>
        <div style={{ fontSize: 30, marginBottom: 60 }}>{menu.date}</div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 18,
          }}
        >
          Appetizers
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginBottom: 50,
          }}
        >
          {menu.appetizers.map((app, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 32 }}>{app.name}</div>
              <div style={{ fontStyle: "italic", fontSize: 24, opacity: 0.8 }}>
                {app.description}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 10,
          }}
        >
          First Course
        </div>
        <div style={{ fontWeight: 700, fontSize: 32 }}>
          {menu.firstCourse.name}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 24,
            opacity: 0.8,
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          {menu.firstCourse.description}
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 10,
          }}
        >
          Main Course
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 32,
            textAlign: "center",
          }}
        >
          {menu.mainCourses.map((mc) => mc.name).join(" or ")}
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 24,
            opacity: 0.8,
            marginBottom: 50,
          }}
        >
          Choice of
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            fontStyle: "italic",
            marginBottom: 10,
          }}
        >
          Dessert
        </div>
        <div style={{ fontWeight: 700, fontSize: 32 }}>{menu.dessert.name}</div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 24,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          {menu.dessert.description}
        </div>

        <div
          style={{
            fontStyle: "italic",
            fontSize: 36,
            fontWeight: 700,
            marginTop: "auto",
            textAlign: "center",
          }}
        >
          Served in Honor of {menu.honoree}
        </div>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formatParam = (searchParams.get("format") ?? "landscape") as Format;
  const format: Format =
    formatParam === "square" || formatParam === "story"
      ? formatParam
      : "landscape";

  const menu = await loadMenu(request);
  const dimensions = FORMAT_DIMENSIONS[format];

  let element: React.ReactElement;
  switch (format) {
    case "square":
      element = renderSquare(menu);
      break;
    case "story":
      element = renderStory(menu);
      break;
    default:
      element = renderLandscape(menu);
  }

  return new ImageResponse(element, dimensions);
}
