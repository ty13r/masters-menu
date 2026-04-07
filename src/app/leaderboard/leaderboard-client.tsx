"use client";

import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardClient() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#006747] text-white py-4 px-6">
        <h1
          className="text-xl font-bold text-center"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Most Popular Menus
        </h1>
        <p className="text-center text-sm opacity-80 mt-1">
          Ranked by social media engagement
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/" className="text-sm underline opacity-80 hover:opacity-100">
            Create Menu
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <LeaderboardTable />
      </main>
    </div>
  );
}
