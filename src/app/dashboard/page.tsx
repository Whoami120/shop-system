import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, Receipt, Box, TrendingUp, ShoppingCart, Plus, Truck, AlertTriangle } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="text-brand mb-2">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  // Dashboard overview is for admins only
  if (user.role === "CASHIER") {
    redirect("/dashboard/sale");
  }
  if (user.role === "STOCK") {
    redirect("/dashboard/products");
  }

  const shopId = user.shopId;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaySales = await prisma.stockMove.findMany({
    where: { shopId, type: "SALE", createdAt: { gte: startOfToday } },
    include: { product: true },
  });

  let todaySalesTotal = 0;
  for (const sale of todaySales) {
    todaySalesTotal += sale.quantity * sale.product.price;
  }

  const products = await prisma.product.findMany({ where: { shopId } });

  let stockValue = 0;
  for (const p of products) {
    stockValue += p.price * p.quantity;
  }

  const lowStock = products.filter((p) => p.quantity <= 5);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const shopInitials = user.shop.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-6">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-48">
        {/* Background: image if set, else brand color */}
        {user.shop.imageUrl ? (
          <img
            src={user.shop.imageUrl}
            alt={user.shop.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-dark" />
        )}
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Welcome panel */}
        <div className="relative h-full flex items-end p-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-brand font-bold text-xl">
              {shopInitials}
            </div>
            <div>
              <p className="text-white/80 text-sm">Bienvenue 👋</p>
              <p className="text-white text-2xl font-bold">{user.shop.name}</p>
              <p className="text-white/70 text-xs">
                {user.name} · {today}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Wallet size={22} />}
          label="Ventes aujourd'hui (MAD)"
          value={todaySalesTotal.toFixed(2)}
        />
        <StatCard
          icon={<Receipt size={22} />}
          label="Nombre de ventes"
          value={String(todaySales.length)}
        />
        <StatCard
          icon={<Box size={22} />}
          label="Produits"
          value={String(products.length)}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Valeur du stock (MAD)"
          value={stockValue.toFixed(2)}
        />
      </div>

      {/* Shortcuts + low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shortcuts */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="font-medium text-gray-800 mb-3">Raccourcis</p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/dashboard/sale"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
            >
              <ShoppingCart size={16} /> Vendre
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} /> Produit
            </Link>
            <Link
              href="/dashboard/receptions"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
            >
              <Truck size={16} /> Réception
            </Link>
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-orange-500" />
            <p className="font-medium text-gray-800">Stock bas</p>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun produit en stock bas. 👍</p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStock.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-red-600 font-bold">{p.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}