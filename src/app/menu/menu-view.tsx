"use client";

import { useRef } from "react";
import MenuCard from "@/components/MenuCard";
import SocialShareButtons from "@/components/SocialShareButtons";
import { decodeMenu } from "@/lib/url-encoding";

interface Props {
  encoded: string;
}

export default function MenuViewClient({ encoded }: Props) {
  const menu = encoded ? decodeMenu(encoded) : null;
  const cardRef = useRef<HTMLDivElement>(null);

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#006747] mb-2">
            Menu Not Found
          </h1>
          <p className="text-gray-600">
            This link may be invalid or expired.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-5 py-2 bg-[#006747] text-white rounded-lg"
          >
            Create Your Own
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-3xl py-8 px-4">
        <div className="rounded-lg overflow-hidden shadow-xl">
          <MenuCard ref={cardRef} menu={menu} />
        </div>
        <div className="mt-6">
          <SocialShareButtons menu={menu} cardRef={cardRef} />
        </div>
        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#006747] text-white rounded-lg font-medium hover:bg-[#005238] transition-colors"
          >
            Create Your Own Menu
          </a>
        </div>
      </div>
    </div>
  );
}
