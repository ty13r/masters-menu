import { Suspense } from "react";
import type { Metadata } from "next";
import { decodeMenu } from "@/lib/url-encoding";
import MenuViewClient from "./menu-view";

interface Props {
  searchParams: Promise<{ d?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const encoded = params.d;
  const menu = encoded ? decodeMenu(encoded) : null;

  const title = menu
    ? `${menu.honoree}'s Masters Club Champions`
    : "Masters Club Champions Menu Builder";
  const description = menu
    ? `Check out ${menu.honoree}'s Masters Club Champions menu!`
    : "Create your own Masters Club Champions menu and share it with friends.";

  const ogUrl = encoded
    ? `/api/og?d=${encoded}`
    : "/api/og";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function MenuPage({ searchParams }: Props) {
  const params = await searchParams;
  const encoded = params.d ?? "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MenuViewClient encoded={encoded} />
    </Suspense>
  );
}
