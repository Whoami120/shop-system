import Link from "next/link";
import { requireSuperAdmin } from "@/lib/requireSuperAdmin";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-indigo-950 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-indigo-800">
          <h2 className="text-lg font-bold">Owner Panel</h2>
          <p className="text-xs text-indigo-300 mt-1">{user.name}</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          <Link
            href="/owner"
            className="px-3 py-2 rounded-md text-sm text-indigo-100 hover:bg-indigo-800 transition-colors"
          >
            Boutiques
          </Link>
        </nav>

        <div className="p-3 border-t border-indigo-800">
          <Link
            href="/logout"
            prefetch={false}
            className="block px-3 py-2 rounded-md text-sm text-indigo-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            Déconnexion
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}