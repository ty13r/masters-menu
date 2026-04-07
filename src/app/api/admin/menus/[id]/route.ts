import { NextRequest, NextResponse } from "next/server";
import { deleteMenu, updateMenu } from "@/lib/menu-storage";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    await updateMenu(id, {
      hidden: typeof body.hidden === "boolean" ? body.hidden : undefined,
      featured: typeof body.featured === "boolean" ? body.featured : undefined,
      popularityBoost:
        typeof body.popularityBoost === "number"
          ? body.popularityBoost
          : undefined,
      theme:
        body.theme === null || typeof body.theme === "string"
          ? body.theme
          : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin updateMenu failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await deleteMenu(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin deleteMenu failed:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
