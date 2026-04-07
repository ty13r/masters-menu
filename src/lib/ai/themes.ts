export type ThemeId =
  | "posh"
  | "funny"
  | "roast-pro"
  | "bbq"
  | "plant"
  | "cocktail"
  | "comfort";

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
  shortDescription: string;
}

export const THEMES: ReadonlyArray<Theme> = [
  {
    id: "roast-pro",
    label: "Roast a Pro Golfer",
    emoji: "🏌️",
    shortDescription: "Spicy roast of a famous golfer",
  },
  {
    id: "posh",
    label: "Posh & Classic",
    emoji: "🎩",
    shortDescription: "Augusta-traditional, French-influenced",
  },
  {
    id: "funny",
    label: "Funny Roast",
    emoji: "😂",
    shortDescription: "Friendly ribbing of the honoree",
  },
  {
    id: "bbq",
    label: "Southern BBQ",
    emoji: "🍖",
    shortDescription: "Smoke, bourbon, comfort",
  },
  {
    id: "plant",
    label: "Plant-Forward",
    emoji: "🥬",
    shortDescription: "Vegetarian without being preachy",
  },
  {
    id: "cocktail",
    label: "Cocktail Party",
    emoji: "🍸",
    shortDescription: "Small bites, big personalities",
  },
  {
    id: "comfort",
    label: "Comfort Food",
    emoji: "🍝",
    shortDescription: "Childhood favorites elevated",
  },
];

export function getTheme(id: ThemeId | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
