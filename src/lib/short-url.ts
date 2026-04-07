import type { MenuData } from "./menu-data";
import { encodeMenu } from "./url-encoding";

const cache = new WeakMap<MenuData, { id: string; url: string }>();

export async function ensureShortUrl(
  menu: MenuData,
  theme?: string | null
): Promise<{ id: string; url: string }> {
  const cached = cache.get(menu);
  if (cached) return cached;

  const encoded = encodeMenu(menu);
  const res = await fetch("/api/menus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menuData: encoded,
      honoree: menu.honoree,
      theme: theme ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create short URL");
  const data = (await res.json()) as { id: string; url: string };
  const result = {
    id: data.id,
    url: `${window.location.origin}${data.url}`,
  };
  cache.set(menu, result);
  return result;
}
