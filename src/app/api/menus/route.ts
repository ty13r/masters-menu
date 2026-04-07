import { NextRequest, NextResponse } from "next/server";
import { listMenus, saveMenu } from "@/lib/menu-storage";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { menuData, honoree, theme } = body;

  if (!menuData || typeof menuData !== "string") {
    return NextResponse.json(
      { error: "menuData is required" },
      { status: 400 }
    );
  }
  if (!honoree || typeof honoree !== "string") {
    return NextResponse.json(
      { error: "honoree is required" },
      { status: 400 }
    );
  }

  try {
    const id = await saveMenu(
      menuData,
      honoree,
      typeof theme === "string" && theme ? theme : null
    );
    return NextResponse.json({ id, url: `/m/${id}` });
  } catch (err) {
    console.error("saveMenu failed:", err);
    return NextResponse.json(
      { error: "Failed to save menu" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get("theme");
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "recent" ? "recent" : "popular";
  const limit = Math.min(Number(searchParams.get("limit") ?? 60) || 60, 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0);
  const exclude = searchParams.get("exclude") ?? undefined;
  const search = searchParams.get("q") ?? undefined;

  try {
    const menus = await listMenus({
      theme: theme && theme !== "all" ? theme : null,
      sort,
      limit,
      offset,
      exclude,
      search,
    });
    return NextResponse.json(
      menus.map((m) => ({
        id: m.id,
        honoree: m.honoree,
        theme: m.theme,
        likeCount: m.likeCount,
        featured: m.featured,
        createdAt: m.createdAt,
      }))
    );
  } catch (err) {
    console.error("listMenus failed:", err);
    return NextResponse.json({ error: "Failed to list menus" }, { status: 500 });
  }
}
