import { listMenus, countMenus } from "@/lib/menu-storage";
import AdminMenuRow from "./AdminMenuRow";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 50;

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const pageNum = Math.max(1, Number(params.page ?? 1) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const [menus, total] = await Promise.all([
    listMenus({
      sort: "recent",
      limit: PAGE_SIZE,
      offset,
      includeHidden: true,
    }),
    countMenus(true),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#006747] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Admin · Menus
          </h1>
          <div className="text-sm opacity-90">
            {total} total · page {pageNum} / {totalPages}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-2">Thumb</th>
                <th className="p-2">Honoree</th>
                <th className="p-2">Theme</th>
                <th className="p-2">Likes</th>
                <th className="p-2">Boost</th>
                <th className="p-2">Featured</th>
                <th className="p-2">Hidden</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((m) => (
                <AdminMenuRow
                  key={m.id}
                  menu={{
                    id: m.id,
                    honoree: m.honoree,
                    theme: m.theme,
                    likeCount: m.likeCount,
                    featured: m.featured,
                    hidden: m.hidden,
                    popularityBoost: m.popularityBoost,
                    createdAt: m.createdAt,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {pageNum > 1 && (
            <a
              href={`/admin?page=${pageNum - 1}`}
              className="px-3 py-1.5 border rounded text-sm hover:bg-white"
            >
              ← Prev
            </a>
          )}
          {pageNum < totalPages && (
            <a
              href={`/admin?page=${pageNum + 1}`}
              className="px-3 py-1.5 border rounded text-sm hover:bg-white"
            >
              Next →
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
