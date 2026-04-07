import { NextRequest } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetsAt: Date;
}

export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "unknown";
}

/**
 * Sliding 1-hour window, max 10 requests per IP. Backed by Postgres so it
 * persists across deployments and is shared across all serverless instances.
 *
 * Skipped entirely in development so localhost iteration isn't capped.
 */
export async function checkAndIncrement(ip: string): Promise<RateLimitResult> {
  if (process.env.NODE_ENV !== "production") {
    return {
      ok: true,
      remaining: MAX_REQUESTS,
      resetsAt: new Date(Date.now() + WINDOW_MS),
    };
  }

  await ensureSchema();
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  // Look up the existing row for this IP
  const existing = await sql<{
    window_start: string;
    count: number;
  }>`SELECT window_start::text AS window_start, count
     FROM ai_rate_limits WHERE ip = ${ip}`;

  if (existing.rows.length === 0) {
    await sql`INSERT INTO ai_rate_limits (ip, window_start, count)
              VALUES (${ip}, ${now.toISOString()}, 1)`;
    return {
      ok: true,
      remaining: MAX_REQUESTS - 1,
      resetsAt: new Date(now.getTime() + WINDOW_MS),
    };
  }

  const row = existing.rows[0];
  const rowWindowStart = new Date(row.window_start);

  // If the existing window has expired, reset it
  if (rowWindowStart < windowStart) {
    await sql`UPDATE ai_rate_limits
              SET window_start = ${now.toISOString()}, count = 1
              WHERE ip = ${ip}`;
    return {
      ok: true,
      remaining: MAX_REQUESTS - 1,
      resetsAt: new Date(now.getTime() + WINDOW_MS),
    };
  }

  // Within the window — increment if under the cap
  if (row.count >= MAX_REQUESTS) {
    return {
      ok: false,
      remaining: 0,
      resetsAt: new Date(rowWindowStart.getTime() + WINDOW_MS),
    };
  }

  await sql`UPDATE ai_rate_limits
            SET count = count + 1
            WHERE ip = ${ip}`;
  return {
    ok: true,
    remaining: MAX_REQUESTS - 1 - row.count,
    resetsAt: new Date(rowWindowStart.getTime() + WINDOW_MS),
  };
}
