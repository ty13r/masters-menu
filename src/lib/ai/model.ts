import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Centralised Anthropic model factory.
 *
 * The user has an Anthropic API key stored in the env var traditionally
 * named `AI_GATEWAY_API_KEY` (a leftover from a planned Vercel AI Gateway
 * setup that was abandoned in favor of direct Anthropic auth). We accept
 * either name so future re-pulls can use the canonical `ANTHROPIC_API_KEY`
 * if the user decides to rename it.
 */
export function anthropicModel() {
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No Anthropic API key found. Set ANTHROPIC_API_KEY (or AI_GATEWAY_API_KEY)."
    );
  }
  const anthropic = createAnthropic({
    apiKey,
    baseURL: "https://api.anthropic.com/v1",
  });
  return anthropic("claude-sonnet-4-6");
}
