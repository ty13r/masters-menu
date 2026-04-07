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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Masters Club Dinner Menu Builder",
  description:
    "Create your own Masters Club Dinner menu and share it with friends on social media.",
  openGraph: {
    title: "Masters Club Dinner Menu Builder",
    description:
      "Create your own Masters Club Dinner menu and share it with friends on social media.",
    images: [
      { url: "/api/og?format=landscape", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Club Dinner Menu Builder",
    description:
      "Create your own Masters Club Dinner menu and share it with friends on social media.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
