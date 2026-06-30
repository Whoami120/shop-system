import { syncUser } from "@/lib/syncUser";
import { getShopModules } from "@/lib/getShopModules";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import { LayoutDashboard, Boxes, ShoppingCart, Truck, Settings } from "lucide-react";

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "CASHIER") return "Caissier";
  if (role === "STOCK") return "Stock";
  if (role === "SUPERADMIN") return "Owner";
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

  const enabledModules = await getShopModules(user.shopId);
  const role = user.role;

  // Helper: keep an item only if the role allows it
  const allow = (roles: string[]) => roles.includes(role);

  // Build groups, filtered by module + role
  const groups = [];

  if (enabledModules.includes("dashboard") && role === "ADMIN") {
    groups.push({
      key: "dashboard",
      label: "Tableau de bord",
      icon: <LayoutDashboard size={18} />,
      items: [{ href: "/dashboard", label: "Tableau de bord" }],
    });
  }

  if (enabledModules.includes("inventory")) {
    const items = [];
    if (allow(["ADMIN", "STOCK"])) items.push({ href: "/dashboard/products", label: "Produits" });
    if (allow(["ADMIN", "STOCK"])) items.push({ href: "/dashboard/broken", label: "Cassé / perdu" });
    if (allow(["ADMIN"])) items.push({ href: "/dashboard/history", label: "Historique" });
    if (items.length > 0) {
      groups.push({ key: "inventory", label: "Inventaire", icon: <Boxes size={18} />, items });
    }
  }

  if (enabledModules.includes("sales")) {
    const items = [];
    if (allow(["ADMIN", "CASHIER"])) items.push({ href: "/dashboard/sale", label: "Vente" });
    if (allow(["ADMIN"])) items.push({ href: "/dashboard/sales-history", label: "Historique des ventes" });
    if (items.length > 0) {
      groups.push({ key: "sales", label: "Ventes", icon: <ShoppingCart size={18} />, items });
    }
  }

  if (enabledModules.includes("purchases")) {
    const items = [];
    if (allow(["ADMIN", "STOCK"])) items.push({ href: "/dashboard/suppliers", label: "Fournisseurs" });
    if (allow(["ADMIN", "STOCK"])) items.push({ href: "/dashboard/receptions", label: "Réceptions" });
    if (items.length > 0) {
      groups.push({ key: "purchases", label: "Achats", icon: <Truck size={18} />, items });
    }
  }

  if (enabledModules.includes("settings")) {
    const items = [];
    if (allow(["ADMIN"])) items.push({ href: "/dashboard/users", label: "Utilisateurs" });
    if (allow(["ADMIN"])) items.push({ href: "/dashboard/settings", label: "Paramètres boutique" });
    if (items.length > 0) {
      groups.push({ key: "settings", label: "Paramètres", icon: <Settings size={18} />, items });
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar groups={groups} userName={user.name} userRole={roleLabel(user.role)} />
      <main className="flex-1 bg-background min-w-0">{children}</main>
    </div>
  );
}