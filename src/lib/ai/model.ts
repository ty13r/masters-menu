import { createAnthropic } from "@ai-sdk/anthropic";
import fs from "fs";
import path from "path";

/**
 * Centralised Anthropic model factory.
 *
 * Reads `ANTHROPIC_API_KEY` from process.env (production / Vercel) or
 * falls back to parsing `.env.local` directly in local dev.
 *
 * The fallback exists because the Claude Code harness used during local
 * development exports `ANTHROPIC_API_KEY=""` (empty string) and
 * `ANTHROPIC_BASE_URL=https://api.anthropic.com` into the shell. Next.js's
 * dotenv loader does NOT override pre-existing env vars, so the empty
 * string from the shell wins over the real key in `.env.local`. The
 * manual file fallback bypasses that.
 */
let cachedKey: string | null | undefined;

function readKeyFromEnvFile(): string | null {
  try {
    const file = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(file)) return null;
    const content = fs.readFileSync(file, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*ANTHROPIC_API_KEY\s*=\s*"?([^"\n]+)"?\s*$/);
      if (m && m[1]) return m[1];
    }
  } catch {
    // Ignore — fall through to undefined
  }
  return null;
}

function getApiKey(): string {
  if (cachedKey !== undefined) {
    if (cachedKey) return cachedKey;
    throw new Error(
      "No Anthropic API key found. Set ANTHROPIC_API_KEY in your env."
    );
  }
  // process.env first (production / Vercel)
  const fromEnv =
    (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) ||
    (process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_API_KEY.trim());
  if (fromEnv) {
    cachedKey = fromEnv;
    return cachedKey;
  }
  // Local dev fallback: parse .env.local directly
  const fromFile = readKeyFromEnvFile();
  if (fromFile) {
    cachedKey = fromFile;
    return cachedKey;
  }
  cachedKey = null;
  throw new Error(
    "No Anthropic API key found. Set ANTHROPIC_API_KEY in your env."
  );
}

export function anthropicModel() {
  const anthropic = createAnthropic({
    apiKey: getApiKey(),
    baseURL: "https://api.anthropic.com/v1",
  });
  return anthropic("claude-sonnet-4-6");
}
