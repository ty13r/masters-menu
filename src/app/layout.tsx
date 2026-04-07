import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

// Prefer the stable production URL over VERCEL_URL, which resolves to a
// per-deployment preview URL that sits behind Vercel deployment protection —
// social media scrapers can't access those, which breaks OG previews.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

const SITE_TITLE = "Masters Champions Dinner Menu Generator";
const SITE_DESCRIPTION =
  "Create and share a meal that reflects you. The Masters Champions Dinner Menu Generator.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/api/og?format=landscape", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/api/og?format=landscape"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="text-center py-4 px-4 text-xs text-gray-500 space-y-1">
          <div>
            By{" "}
            <a
              href="https://www.instagram.com/forewhisperer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006747] hover:underline"
            >
              Fore Whisperer
            </a>
          </div>
          <div className="text-[10px] text-gray-400 max-w-md mx-auto leading-snug">
            This website is in no way affiliated with, endorsed by, or
            sponsored by Augusta National Golf Club, the Masters Tournament,
            or any related entities. All trademarks are property of their
            respective owners.
          </div>
        </footer>
      </body>
    </html>
  );
}
