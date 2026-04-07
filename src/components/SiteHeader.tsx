import Link from "next/link";

interface Props {
  showPopularLink?: boolean;
}

export default function SiteHeader({ showPopularLink = true }: Props) {
  return (
    <header className="bg-[#006747] text-white py-4 px-6">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex-1" />
        <div className="text-center">
          <Link
            href="/"
            className="text-xl font-bold hover:opacity-90"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Masters Champions Dinner Menu Generator
          </Link>
        </div>
        <div className="flex-1 flex justify-end">
          {showPopularLink && (
            <Link
              href="/leaderboard"
              className="text-sm text-white/90 hover:text-white underline"
            >
              Popular Menus
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
