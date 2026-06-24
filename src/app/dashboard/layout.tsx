import Link from "next/link";
import { syncUser } from "@/lib/syncUser";
import { getShopModules } from "@/lib/getShopModules";
import { redirect } from "next/navigation";

// Each link now also says which MODULE it belongs to
const allLinks = [
  { href: "/dashboard", label: "Tableau de bord", module: "dashboard", roles: ["ADMIN", "CASHIER", "STOCK"] },
  { href: "/dashboard/products", label: "Produits", module: "inventory", roles: ["ADMIN", "STOCK"] },
  { href: "/dashboard/broken", label: "Cassé / perdu", module: "inventory", roles: ["ADMIN", "STOCK"] },
  { href: "/dashboard/history", label: "Historique", module: "inventory", roles: ["ADMIN"] },
  { href: "/dashboard/sale", label: "Vente", module: "sales", roles: ["ADMIN", "CASHIER"] },
  { href: "/dashboard/suppliers", label: "Fournisseurs", module: "purchases", roles: ["ADMIN", "STOCK"] },
  { href: "/dashboard/receptions", label: "Réceptions", module: "purchases", roles: ["ADMIN", "STOCK"] },
  { href: "/dashboard/users", label: "Utilisateurs", module: "settings", roles: ["ADMIN"] },
];

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "CASHIER") return "Caissier";
  if (role === "STOCK") return "Stock";
  return role;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  // Get the modules this shop has enabled
  const enabledModules = await getShopModules(user.shopId);

  // Show a link only if: the shop has its module AND the user's role is allowed
  const links = allLinks.filter(
    (link) =>
      enabledModules.includes(link.module) && link.roles.includes(user.role)
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-slate-700">
          <h2 className="text-lg font-bold">Shop System</h2>
        </div>

        <div className="px-5 py-4 border-b border-slate-700">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-400">{roleLabel(user.role)}</p>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <Link
            href="/logout"
            prefetch={false}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            Déconnexion
          </Link>
        </div>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}