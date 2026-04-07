import type { ThemeId } from "./themes";
import type { MenuData, Dish } from "@/lib/menu-data";

const FORMAT_RULES = `
Format expectations:
- Dish names: 2 to 6 words, evocative and specific (e.g. "Smoked Wagyu Tartare", not "Beef Appetizer")
- Dish descriptions: 4 to 10 words listing key ingredients or sides (e.g. "Truffle aioli, brioche toast, microgreens")
- Beverage lines: full pairing format like "2015 Salon 'S', Brut, Le Mesnil-sur-Oger, Champagne" or "Buffalo Trace Bourbon Old Fashioned, Luxardo cherry"
- Date: any format like "April 7, 2026" — just one short line
`.trim();

const THEME_GUIDANCE: Record<ThemeId, string> = {
  posh: `
Theme: Posh & Classic. This is the traditional Augusta National Champions Dinner aesthetic — French and Continental influence, classical service, vintage Bordeaux and Burgundy on the wine list, white-tablecloth elegance. Think Escoffier meets the American South. Restrained, refined, never gimmicky.
`,
  funny: `
Theme: Funny Roast (friend / family honoree). Weave the honoree's name into 1-2 dish names or descriptions in a playful way. Inside jokes about food preferences are fair game ("\${honoree}'s Famous Forgotten Onions"). Dish names should be punny but the food itself should still sound delicious. Wines can have funny labels invented for the occasion.

SAFETY RAIL: Playful ribbing only. Never cruel. Never about appearance, weight, intelligence, family, finances, relationships, or anything embarrassing. The honoree should laugh, not cringe. When in doubt, joke about food, golf, or generic personality quirks (loves coffee, always late, etc).
`,
  "roast-pro": `
Theme: Roast a Pro Golfer. The honoree is the public figure named in the prompt — a real, famous professional golfer. Weave well-publicized golf career material into dish names, descriptions, and beverage pairings. Lean into on-course meltdowns, signature playing style quirks, equipment fixations, and the famous incidents that mainstream golf media (Golf Channel, No Laying Up, Barstool, late-night sports shows) routinely joke about and that the player themselves often acknowledges.

This menu will be served at a fictional Champions Dinner roast in their honor — the room is full of golfers laughing warmly with them, not at them.

SAFETY RAIL FOR PRO GOLFER ROAST:
- Use only publicly-known, mainstream-media-discussed material
- Do not invent scandals, rumors, or incidents
- No politics, no family members, no romantic relationships, no health beyond well-known on-course incidents
- No private life material
- Stay in the spirit of a friendly Champions Dinner toast — warm, knowing, occasionally pointed, never cruel
- If you can't think of a clean angle for this golfer, lean on their playing style, signature shots, equipment, or famous career moments instead of inventing dirt

Aim for at least 3-4 of the menu items to clearly reference the honoree's career — this is the whole point.
`,
  bbq: `
Theme: Southern BBQ. Smoke, bourbon, brisket, ribs, pulled pork, biscuits, collards, peach cobbler. Beverage list leans on small-batch bourbons and a strong American beer or two instead of European wines. Comfort, abundance, regional pride. Augusta is in Georgia — that should come through.
`,
  plant: `
Theme: Plant-Forward. Entirely vegetarian or vegan, but treat plants like the main event, not a substitute. Heirloom vegetables, smoked mushrooms, grains, legumes, beautiful sauces. Wine list is still real wine. Don't be preachy, don't apologize, don't use the word "alternative". Make it crave-able.
`,
  cocktail: `
Theme: Cocktail Party. Small, shareable bites instead of plated courses. Each "course" is more like a station or passed canapé. Beverage list is 4 cocktails, not 4 wines. Energetic, social, fun. Less ceremony, more conversation.
`,
  comfort: `
Theme: Comfort Food. Elevated childhood favorites. Mac and cheese with truffle. Tomato soup with grilled cheese. Pot pie. Meatloaf done right. Warm, nostalgic, deeply satisfying. Wines should be approachable — no dusty trophies. Maybe a great beer.
`,
};

export interface PromptContext {
  themeId: ThemeId;
  freeform?: string;
  honoree: string;
}

export function buildSystemPrompt({
  themeId,
  freeform,
  honoree,
}: PromptContext): string {
  const themeGuidance = THEME_GUIDANCE[themeId].replace(
    /\$\{honoree\}/g,
    honoree
  );

  const freeformBlock = freeform
    ? `\n\nAdditional user direction (treat as a strong steer):\n"${freeform.trim()}"`
    : "";

  return `You are a creative menu writer composing a Masters Champions Dinner menu honoring ${honoree}. The Masters Champions Dinner is the most exclusive private dinner in golf — held the Tuesday of Masters week at Augusta National, hosted by the previous year's champion, with every living past champion in attendance. Treat this menu as if it were really going to be served in that room.

${themeGuidance.trim()}${freeformBlock}

${FORMAT_RULES}

Return ONLY the structured menu data. Do not add commentary, headers, or explanation.`;
}

export function buildFullMenuPrompt(honoree: string): string {
  return `Create a complete Masters Champions Dinner menu honoring ${honoree}. Return all 4 appetizers, the first course, both main course options, the dessert, and 4 beverage pairings. Also pick a date string (any reasonable Masters Tuesday format).`;
}

export type FieldKind =
  | "appetizer"
  | "main-course"
  | "first-course"
  | "dessert"
  | "beverage"
  | "date";

export interface FieldRequest {
  kind: FieldKind;
  index?: number;
}

export function buildFieldPrompt(
  field: FieldRequest,
  currentMenu: MenuData,
  rejectedSuggestions?: Array<{ name: string; description: string }>
): string {
  const summary = summarizeMenu(currentMenu);

  const rejectedBlock =
    rejectedSuggestions && rejectedSuggestions.length > 0
      ? `\n\nThe user has already rejected these suggestions for this same field — DO NOT propose anything similar:\n${rejectedSuggestions
          .map((r, i) => `  ${i + 1}. ${r.name}${r.description ? ` — ${r.description}` : ""}`)
          .join("\n")}`
      : "";

  const target = describeField(field);

  return `Here is the current state of the menu so you can keep your suggestion consistent with the rest of it:

${summary}

Generate a single new ${target}. Return only the name and description (description can be an empty string for beverages and dates).${rejectedBlock}`;
}

function summarizeMenu(menu: MenuData): string {
  const appetizers = menu.appetizers
    .map((d, i) => `  Appetizer ${i + 1}: ${formatDish(d)}`)
    .join("\n");
  const mains = menu.mainCourses
    .map((d, i) => `  Main ${i + 1}: ${formatDish(d)}`)
    .join("\n");
  const wines = menu.wines.map((w, i) => `  Beverage ${i + 1}: ${w || "(empty)"}`).join("\n");
  return `Honoree: ${menu.honoree}
Date: ${menu.date || "(empty)"}

Appetizers:
${appetizers}

First Course: ${formatDish(menu.firstCourse)}

Main Courses (Choice of):
${mains}

Dessert: ${formatDish(menu.dessert)}

Beverage Pairings:
${wines}`;
}

function formatDish(d: Dish): string {
  if (!d.name && !d.description) return "(empty)";
  return d.description ? `${d.name} — ${d.description}` : d.name;
}

function describeField(field: FieldRequest): string {
  switch (field.kind) {
    case "appetizer":
      return `appetizer (item ${(field.index ?? 0) + 1} of 4)`;
    case "first-course":
      return "first course dish";
    case "main-course":
      return `main course option ${(field.index ?? 0) + 1} of 2`;
    case "dessert":
      return "dessert";
    case "beverage":
      return `beverage pairing (item ${(field.index ?? 0) + 1} of 4) — return the full beverage line as the 'name' field, leave 'description' empty`;
    case "date":
      return "menu date — return as the 'name' field (e.g. 'April 7, 2026'), leave 'description' empty";
  }
}
