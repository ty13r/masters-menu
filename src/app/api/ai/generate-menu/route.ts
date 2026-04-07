import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { anthropicModel } from "@/lib/ai/model";
import { generatedMenuSchema, normalizeMenu } from "@/lib/ai/menu-schema";
import { buildSystemPrompt, buildFullMenuPrompt } from "@/lib/ai/prompts";
import { THEMES, type ThemeId } from "@/lib/ai/themes";
import { checkAndIncrement, getClientIp } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];

const requestSchema = z.object({
  honoree: z.string().min(1).max(80),
  themeId: z.enum(VALID_THEME_IDS).optional(),
  freeform: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request: " + parsed.error.message },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const limit = await checkAndIncrement(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "You've used your AI generations for the hour. Try again in a bit!",
        resetsAt: limit.resetsAt.toISOString(),
      },
      { status: 429 }
    );
  }

  const { honoree, themeId, freeform } = parsed.data;

  try {
    const result = await generateObject({
      model: anthropicModel(),
      schema: generatedMenuSchema,
      system: buildSystemPrompt({ themeId: themeId ?? null, freeform, honoree }),
      prompt: buildFullMenuPrompt(honoree),
    });

    return NextResponse.json({ menu: normalizeMenu(result.object) });
  } catch (err) {
    console.error("[/api/ai/generate-menu] generateObject failed:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't generate a menu right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
