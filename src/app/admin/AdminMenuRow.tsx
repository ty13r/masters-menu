"use client";

import { useState } from "react";
import { THEMES } from "@/lib/ai/themes";

interface MenuRowData {
  id: string;
  honoree: string;
  theme: string | null;
  likeCount: number;
  featured: boolean;
  hidden: boolean;
  popularityBoost: number;
  createdAt: string;
}

export default function AdminMenuRow({ menu }: { menu: MenuRowData }) {
  const [hidden, setHidden] = useState(menu.hidden);
  const [featured, setFeatured] = useState(menu.featured);
  const [boost, setBoost] = useState(menu.popularityBoost);
  const [theme, setTheme] = useState<string | null>(menu.theme);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/menus/${menu.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete menu for ${menu.honoree}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/menus/${menu.id}`, {
        method: "DELETE",
      });
      if (res.ok) setDeleted(true);
    } finally {
      setBusy(false);
    }
  }

  if (deleted) return null;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/og?id=${menu.id}&format=square`}
          alt=""
          className="w-16 h-16 object-cover rounded"
          loading="lazy"
        />
      </td>
      <td className="p-2 font-medium">{menu.honoree}</td>
      <td className="p-2">
        <select
          value={theme ?? ""}
          disabled={busy}
          onChange={(e) => {
            const v = e.target.value || null;
            setTheme(v);
            patch({ theme: v });
          }}
          className="text-xs border rounded px-1 py-0.5"
        >
          <option value="">—</option>
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 tabular-nums">{menu.likeCount}</td>
      <td className="p-2">
        <input
          type="number"
          value={boost}
          disabled={busy}
          onChange={(e) => setBoost(Number(e.target.value) || 0)}
          onBlur={() => patch({ popularityBoost: boost })}
          className="w-16 text-xs border rounded px-1 py-0.5"
        />
      </td>
      <td className="p-2">
        <input
          type="checkbox"
          checked={featured}
          disabled={busy}
          onChange={(e) => {
            setFeatured(e.target.checked);
            patch({ featured: e.target.checked });
          }}
        />
      </td>
      <td className="p-2">
        <input
          type="checkbox"
          checked={hidden}
          disabled={busy}
          onChange={(e) => {
            setHidden(e.target.checked);
            patch({ hidden: e.target.checked });
          }}
        />
      </td>
      <td className="p-2 text-xs text-gray-500">
        {new Date(menu.createdAt).toLocaleDateString()}
      </td>
      <td className="p-2 whitespace-nowrap">
        <a
          href={`/m/${menu.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#006747] underline text-xs mr-2"
        >
          View
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="text-red-600 underline text-xs cursor-pointer disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
