import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getMenu } from "@/lib/menu-storage";

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
  wines: string[];
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
  wines: [],
};

const FORMAT_DIMENSIONS: Record<Format, { width: number; height: number }> = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

const GREEN = "#006747";

// ---------- Asset loading (cached at module scope) ----------

let logoCache: string | null = null;
async function getLogoDataUrl(): Promise<string> {
  if (logoCache) return logoCache;
  const buf = await fs.readFile(
    path.join(process.cwd(), "public", "augusta-logo.png")
  );
  logoCache = `data:image/png;base64,${buf.toString("base64")}`;
  return logoCache;
}

interface FontDef {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal" | "italic";
}

// The fonts in public/fonts are variable TTFs which satori (used by next/og)
// can't parse — it errors with "Cannot read properties of undefined (reading
// '256')". Fetch static-instance TTFs from jsDelivr's google-fonts mirror at
// runtime and cache for the life of the process.
async function fetchStaticTtf(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.arrayBuffer();
}

let fontsCache: FontDef[] | null = null;
async function getFonts(): Promise<FontDef[]> {
  if (fontsCache) return fontsCache;

  const specs: Array<Omit<FontDef, "data"> & { url: string }> = [
    {
      name: "Playfair Display",
      weight: 700,
      style: "normal",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-normal.ttf",
    },
    {
      name: "Playfair Display",
      weight: 700,
      style: "italic",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-700-italic.ttf",
    },
    {
      name: "Lora",
      weight: 400,
      style: "normal",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf",
    },
    {
      name: "Lora",
      weight: 700,
      style: "normal",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf",
    },
    {
      name: "Lora",
      weight: 400,
      style: "italic",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf",
    },
  ];

  const fonts = await Promise.all(
    specs.map(async ({ url, ...rest }) => {
      const data = await fetchStaticTtf(url);
      return { ...rest, data };
    })
  );
  fontsCache = fonts;
  return fonts;
}

// ---------- Menu loading ----------

async function decodeMenuFromBlob(encoded: string): Promise<Menu | null> {
  try {
    const { decompressFromEncodedURIComponent } = await import("lz-string");
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<Menu>;
    return {
      honoree: parsed.honoree ?? DEFAULT_MENU.honoree,
      date: parsed.date ?? DEFAULT_MENU.date,
      appetizers: parsed.appetizers ?? DEFAULT_MENU.appetizers,
      firstCourse: parsed.firstCourse ?? DEFAULT_MENU.firstCourse,
      mainCourses: parsed.mainCourses ?? DEFAULT_MENU.mainCourses,
      dessert: parsed.dessert ?? DEFAULT_MENU.dessert,
      wines: parsed.wines ?? [],
    };
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

// ---------- Render helpers ----------

interface Scale {
  // Scale factor relative to MenuCard's pixel sizes (designed for ~680px wide).
  base: number;
  cardMaxWidth: number;
  cardPaddingY: number;
  cardPaddingX: number;
  outerPadding: number;
  showWines: boolean;
}

function dishItem(dish: Dish, s: Scale, key?: string | number) {
  return (
    <div
      key={key}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 4 * s.base,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Lora",
          fontWeight: 700,
          fontSize: 16 * s.base,
          color: GREEN,
          textAlign: "center",
        }}
      >
        {dish.name}
      </div>
      {dish.description ? (
        <div
          style={{
            display: "flex",
            fontFamily: "Lora",
            fontStyle: "italic",
            fontSize: 13 * s.base,
            opacity: 0.85,
            color: GREEN,
            textAlign: "center",
          }}
        >
          {dish.description}
        </div>
      ) : null}
    </div>
  );
}

function sectionHeader(text: string, s: Scale) {
  return (
    <div
      style={{
        fontFamily: "Playfair Display",
        fontWeight: 700,
        fontStyle: "italic",
        fontSize: 20 * s.base,
        color: GREEN,
        margin: `0 0 ${12 * s.base}px`,
        letterSpacing: "0.05em",
        display: "flex",
      }}
    >
      {text}
    </div>
  );
}

function renderMenuCard(menu: Menu, logo: string, s: Scale) {
  return (
    <div
      style={{
        background:
          "radial-gradient(ellipse at center, #f8c8d4 0%, #f0a8b8 30%, #e890a8 50%, #d4789a 70%, #c06888 100%)",
        padding: s.outerPadding,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          background: "#FAF8F0",
          maxWidth: s.cardMaxWidth,
          width: "100%",
          padding: `${s.cardPaddingY}px ${s.cardPaddingX}px`,
          color: GREEN,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt=""
          style={{
            height: 80 * s.base,
            width: "auto",
            marginBottom: 12 * s.base,
          }}
        />

        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 28 * s.base,
            fontWeight: 700,
            color: GREEN,
            display: "flex",
          }}
        >
          Masters Club Dinner
        </div>
        <div
          style={{
            fontFamily: "Lora",
            fontSize: 14 * s.base,
            color: GREEN,
            margin: `4px 0 ${28 * s.base}px`,
            display: "flex",
          }}
        >
          {menu.date}
        </div>

        {sectionHeader("Appetizers", s)}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: `${16 * s.base}px ${32 * s.base}px`,
            marginBottom: 24 * s.base,
            maxWidth: s.cardMaxWidth - 2 * s.cardPaddingX,
          }}
        >
          {menu.appetizers.map((app, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: (s.cardMaxWidth - 2 * s.cardPaddingX) / 2 - 32 * s.base,
              }}
            >
              {dishItem(app, s)}
            </div>
          ))}
        </div>

        {sectionHeader("First Course", s)}
        {dishItem(menu.firstCourse, s)}
        <div style={{ height: 20 * s.base }} />

        {sectionHeader("Main Course", s)}
        <div
          style={{
            fontFamily: "Lora",
            fontStyle: "italic",
            fontSize: 14 * s.base,
            color: GREEN,
            marginBottom: 8 * s.base,
            display: "flex",
          }}
        >
          Choice of
        </div>
        <div
          style={{
            fontFamily: "Lora",
            fontWeight: 700,
            fontSize: 18 * s.base,
            color: GREEN,
            marginBottom: 6 * s.base,
            display: "flex",
            textAlign: "center",
          }}
        >
          {menu.mainCourses.map((mc) => mc.name).join(" or ")}
        </div>
        {menu.mainCourses
          .filter((mc) => mc.description)
          .map((mc, i) => (
            <div
              key={i}
              style={{
                fontFamily: "Lora",
                fontStyle: "italic",
                fontSize: 14 * s.base,
                opacity: 0.85,
                color: GREEN,
                marginBottom: 2 * s.base,
                display: "flex",
              }}
            >
              {mc.description}
            </div>
          ))}
        <div style={{ height: 20 * s.base }} />

        {sectionHeader("Dessert", s)}
        {dishItem(menu.dessert, s)}
        <div style={{ height: 20 * s.base }} />

        {s.showWines && menu.wines.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 24 * s.base,
            }}
          >
            {menu.wines.map((wine, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "Lora",
                  fontStyle: "italic",
                  fontSize: 12 * s.base,
                  opacity: 0.8,
                  color: GREEN,
                  display: "flex",
                }}
              >
                {wine}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 22 * s.base,
            opacity: 0.6,
            color: GREEN,
            marginBottom: 16 * s.base,
            display: "flex",
            letterSpacing: "0.4em",
          }}
        >
          ~ * ~
        </div>

        <div
          style={{
            fontFamily: "Playfair Display",
            fontStyle: "italic",
            fontSize: 18 * s.base,
            fontWeight: 700,
            color: GREEN,
            display: "flex",
          }}
        >
          Served in Honor of {menu.honoree}
        </div>
      </div>
    </div>
  );
}

const SCALES: Record<Format, Scale> = {
  // Landscape: 1200x630, very wide and short. Scale down and skip wines so it fits.
  landscape: {
    base: 0.78,
    cardMaxWidth: 580,
    cardPaddingY: 24,
    cardPaddingX: 32,
    outerPadding: 20,
    showWines: false,
  },
  // Square: 1080x1080, near-perfect for the natural card layout.
  square: {
    base: 1.4,
    cardMaxWidth: 950,
    cardPaddingY: 56,
    cardPaddingX: 56,
    outerPadding: 40,
    showWines: true,
  },
  // Story: 1080x1920, taller — bigger type, more breathing room.
  story: {
    base: 1.55,
    cardMaxWidth: 1000,
    cardPaddingY: 80,
    cardPaddingX: 64,
    outerPadding: 40,
    showWines: true,
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const formatParam = (searchParams.get("format") ?? "landscape") as Format;
  const format: Format =
    formatParam === "square" || formatParam === "story"
      ? formatParam
      : "landscape";

  const [menu, logo, fonts] = await Promise.all([
    loadMenu(request),
    getLogoDataUrl(),
    getFonts().catch(() => null),
  ]);

  const dimensions = FORMAT_DIMENSIONS[format];
  const scale = SCALES[format];
  const element = renderMenuCard(menu, logo, scale);

  return new ImageResponse(element, {
    ...dimensions,
    ...(fonts
      ? {
          fonts: fonts.map((f) => ({
            name: f.name,
            data: f.data,
            weight: f.weight,
            style: f.style,
          })),
        }
      : {}),
  });
}
