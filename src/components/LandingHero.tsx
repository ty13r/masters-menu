"use client";

interface Props {
  onStart: () => void;
}

export default function LandingHero({ onStart }: Props) {
  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6"
      style={{
        backgroundImage: "url('/menu-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-[#FAF8F0]/95 backdrop-blur-sm rounded-2xl shadow-2xl px-10 py-12 max-w-xl text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/augusta-logo.png"
          alt="Augusta National Golf Club"
          className="h-20 w-auto mx-auto mb-6"
        />
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#006747] mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Build Your Masters Club Dinner
        </h1>
        <p className="text-[#006747]/80 mb-8 text-base leading-relaxed">
          A guided walkthrough. About two minutes. Then share your menu with
          friends and see if you can top the leaderboard.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="inline-block px-8 py-3 bg-[#006747] text-white rounded-lg font-semibold text-base hover:bg-[#005238] transition-colors cursor-pointer shadow-md"
        >
          Build Your Menu →
        </button>
        <div className="mt-6">
          <a
            href="/leaderboard"
            className="text-sm text-[#006747]/70 hover:text-[#006747] underline"
          >
            View leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}
