import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu } from "@/lib/menu-storage";
import MenuViewClient from "@/app/menu/menu-view";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const stored = await getMenu(id).catch(() => null);

  const title = stored
    ? `${stored.honoree}'s Masters Club Dinner`
    : "Masters Club Dinner Menu Builder";
  const description = stored
    ? `Check out ${stored.honoree}'s Masters Club Dinner menu!`
    : "Create your own Masters Club Dinner menu and share it with friends.";

  const ogUrl = stored ? `/api/og?d=${stored.data}` : "/api/og";

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

export default async function ShortMenuPage({ params }: Props) {
  const { id } = await params;
  const stored = await getMenu(id).catch(() => null);

  if (!stored) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MenuViewClient encoded={stored.data} />
    </Suspense>
  );
}
