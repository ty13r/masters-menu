import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { MenuData } from "./menu-data";

export function encodeMenu(data: MenuData): string {
  return compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeMenu(encoded: string): MenuData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as MenuData;
  } catch {
    return null;
  }
}
