import { z } from "zod";

const dishSchema = z.object({
  name: z.string(),
  description: z.string(),
});

/**
 * Schema for the AI-generated menu. Excludes `honoree` (which we pass in
 * separately).
 *
 * Anthropic's structured output only allows minItems of 0 or 1 on arrays,
 * so we can't enforce exact counts in the schema. The prompt asks for
 * exactly 4 appetizers, 2 main courses, and 4 beverages, and the route
 * normalizes the response (truncate or pad) before returning.
 */
export const generatedMenuSchema = z.object({
  date: z.string(),
  appetizers: z.array(dishSchema),
  firstCourse: dishSchema,
  mainCourses: z.array(dishSchema),
  dessert: dishSchema,
  wines: z.array(z.string()),
});

export type GeneratedMenu = z.infer<typeof generatedMenuSchema>;

const EMPTY_DISH = { name: "", description: "" };

/**
 * Force the AI response to have exactly the expected counts: pad with
 * empty entries if short, truncate if long.
 */
export function normalizeMenu(menu: GeneratedMenu): GeneratedMenu {
  return {
    date: menu.date,
    appetizers: padOrTrim(menu.appetizers, 4, EMPTY_DISH),
    firstCourse: menu.firstCourse,
    mainCourses: padOrTrim(menu.mainCourses, 2, EMPTY_DISH),
    dessert: menu.dessert,
    wines: padOrTrim(menu.wines, 4, ""),
  };
}

function padOrTrim<T>(arr: T[], target: number, filler: T): T[] {
  if (arr.length === target) return arr;
  if (arr.length > target) return arr.slice(0, target);
  return [...arr, ...Array(target - arr.length).fill(filler)];
}

/**
 * Schema for a single field suggestion. Description is empty for
 * beverages and date.
 */
export const fieldSuggestionSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type FieldSuggestion = z.infer<typeof fieldSuggestionSchema>;
