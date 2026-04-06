import type { Metadata } from "next";
import LeaderboardClient from "./leaderboard-client";

export const metadata: Metadata = {
  title: "Leaderboard - Masters Club Dinner",
  description:
    "See who has the most popular Masters Club Dinner menu on social media.",
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
