import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { anthropicModel } from "@/lib/ai/model";
import { fieldSuggestionSchema } from "@/lib/ai/menu-schema";
import {
  buildSystemPrompt,
  buildFieldPrompt,
  type FieldKind,
} from "@/lib/ai/prompts";
import { THEMES, type ThemeId } from "@/lib/ai/themes";
import { checkAndIncrement, getClientIp } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_THEME_IDS = THEMES.map((t) => t.id) as [ThemeId, ...ThemeId[]];

const FIELD_KINDS = [
  "appetizer",
  "main-course",
  "first-course",
  "dessert",
  "beverage",
  "date",
] as const satisfies ReadonlyArray<FieldKind>;

const dishSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const menuSchema = z.object({
  honoree: z.string(),
  date: z.string(),
  appetizers: z.array(dishSchema),
  firstCourse: dishSchema,
  mainCourses: z.array(dishSchema),
  dessert: dishSchema,
  wines: z.array(z.string()),
});

const requestSchema = z.object({
  honoree: z.string().min(1).max(80),
  themeId: z.enum(VALID_THEME_IDS).optional(),
  freeform: z.string().max(500).optional(),
  field: z.object({
    kind: z.enum(FIELD_KINDS),
    index: z.number().int().min(0).optional(),
  }),
  currentMenu: menuSchema,
  rejectedSuggestions: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .max(10)
    .optional(),
  toneTweak: z.string().max(120).optional(),
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

  const {
    honoree,
    themeId = "posh",
    freeform,
    field,
    currentMenu,
    rejectedSuggestions,
    toneTweak,
  } = parsed.data;

  const combinedFreeform = [freeform, toneTweak].filter(Boolean).join(" — ");

  try {
    const result = await generateObject({
      model: anthropicModel(),
      schema: fieldSuggestionSchema,
      system: buildSystemPrompt({
        themeId,
        freeform: combinedFreeform || undefined,
        honoree,
      }),
      prompt: buildFieldPrompt(field, currentMenu, rejectedSuggestions),
    });

    return NextResponse.json({ suggestion: result.object });
  } catch (err) {
    console.error("[/api/ai/suggest-field] generateObject failed:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't generate a suggestion right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
