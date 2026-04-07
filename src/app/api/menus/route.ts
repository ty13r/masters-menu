import { NextRequest, NextResponse } from "next/server";
import { saveMenu } from "@/lib/menu-storage";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { menuData, honoree } = body;

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
    const id = await saveMenu(menuData, honoree);
    return NextResponse.json({ id, url: `/m/${id}` });
  } catch (err) {
    console.error("saveMenu failed:", err);
    return NextResponse.json(
      { error: "Failed to save menu" },
      { status: 500 }
    );
  }
}
