import type { Metadata } from "next";
import LeaderboardClient from "./leaderboard-client";

export const metadata: Metadata = {
  title: "Leaderboard - Masters Club Dinner",
  description:
    "See who has the most popular Masters Club Dinner menu on social media.",
  openGraph: {
    title: "Masters Club Dinner Leaderboard",
    description:
      "See who has the most popular Masters Club Dinner menu on social media.",
    images: [
      { url: "/api/og?format=landscape", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Club Dinner Leaderboard",
    description:
      "See who has the most popular Masters Club Dinner menu on social media.",
    images: ["/api/og?format=landscape"],
  },
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
