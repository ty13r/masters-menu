import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { addLike } from "@/lib/menu-storage";

interface Params {
  params: Promise<{ id: string }>;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const clientId =
    typeof body?.clientId === "string" ? body.clientId : "anon";
  const ip = getClientIp(request);
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${ip}|${clientId}`)
    .digest("hex");

  try {
    const result = await addLike(id, fingerprint);
    return NextResponse.json(result);
  } catch (err) {
    console.error("addLike failed:", err);
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }
}
