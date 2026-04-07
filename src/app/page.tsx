"use client";

import { useRef } from "react";
import { useMenuState } from "@/hooks/useMenuState";
import MenuCard from "@/components/MenuCard";
import MenuEditor from "@/components/MenuEditor";
import SharePanel from "@/components/SharePanel";

export default function Home() {
  const { menu, updateField, updateAppetizer, updateMainCourse, updateWine } =
    useMenuState();
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#006747] text-white py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1" />
          <div className="text-center">
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Masters Club Dinner Menu Builder
            </h1>
            <p className="text-sm opacity-80 mt-1">
              Create your dream Masters dinner and share it with friends
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <a
              href="/leaderboard"
              className="text-sm text-white/90 hover:text-white underline"
            >
              Leaderboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="space-y-6 lg:col-span-1">
            <MenuEditor
              menu={menu}
              updateField={updateField}
              updateAppetizer={updateAppetizer}
              updateMainCourse={updateMainCourse}
              updateWine={updateWine}
            />
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Live Preview
              </h2>
              <SharePanel menu={menu} cardRef={cardRef} />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <MenuCard ref={cardRef} menu={menu} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
