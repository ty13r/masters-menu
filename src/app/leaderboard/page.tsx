import { Suspense } from "react";
import type { Metadata } from "next";
import LeaderboardClient from "./leaderboard-client";

const PAGE_DESCRIPTION =
  "Browse and like the most popular Masters Champions Dinner menus.";

export const metadata: Metadata = {
  title: "Most Popular Menus - Masters Champions Dinner",
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: "Most Popular Menus",
    description: PAGE_DESCRIPTION,
    images: [
      { url: "/api/og?format=landscape", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Most Popular Menus",
    description: PAGE_DESCRIPTION,
    images: ["/api/og?format=landscape"],
  },
};

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LeaderboardClient />
    </Suspense>
  );
}
