import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { TrendingUp, ShoppingBag, BarChart3 } from "lucide-react";
import PrintButton from "../PrintButton";
import ExportButton from "./ExportButton";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN"]);
  const { range } = await searchParams;
  const selected = range || "month";

  const now = new Date();
  let start = new Date();
  if (selected === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (selected === "week") {
    start.setDate(now.getDate() - 7);
  } else if (selected === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (selected === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  }

  const sales = await prisma.sale.findMany({
    where: {
      shopId: user.shopId,
      refunded: false,
      createdAt: { gte: start },
    },
    include: {
      items: { include: { product: true } },
      customer: true,
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const salesCount = sales.length;
  const avgSale = salesCount > 0 ? totalRevenue / salesCount : 0;

  // Sales per day
  const perDayMap = new Map<string, number>();
  for (const s of sales) {
    const key = s.createdAt.toLocaleDateString("fr-FR");
    perDayMap.set(key, (perDayMap.get(key) || 0) + s.total);
  }
  const perDay = Array.from(perDayMap.entries());
  const maxDay = Math.max(1, ...perDay.map(([, v]) => v));

  // Top products (by revenue)
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const s of sales) {
    for (const item of s.items) {
      const prev = productMap.get(item.productId) || {
        name: item.product.name,
        qty: 0,
        revenue: 0,
      };
      prev.qty += item.quantity;
      prev.revenue += item.price * item.quantity;
      productMap.set(item.productId, prev);
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Rows for CSV export
  const exportRows = sales.map((s) => ({
    date: s.createdAt.toLocaleString("fr-FR"),
    client: s.customer ? s.customer.name : "Client de passage",
    cashier: s.user ? s.user.name : "-",
    total: s.total,
  }));

  const ranges = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "7 jours" },
    { key: "month", label: "Ce mois" },
    { key: "year", label: "Cette année" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          title="Rapport des ventes"
          breadcrumb={[{ label: "Rapports" }, { label: "Ventes" }]}
        />
        <div className="flex items-center gap-2">
          <ExportButton rows={exportRows} />
          <PrintButton />
        </div>
      </div>

      {/* Range filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ranges.map((r) => (
          <Link
            key={r.key}
            href={`/dashboard/reports/sales?range=${r.key}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              selected === r.key
                ? "bg-brand text-white border-brand"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp size={16} className="text-blue-500" /> Chiffre d&apos;affaires
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalRevenue.toFixed(2)} MAD</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <ShoppingBag size={16} className="text-green-500" /> Nombre de ventes
          </div>
          <p className="text-2xl font-bold text-gray-800">{salesCount}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <BarChart3 size={16} className="text-purple-500" /> Vente moyenne
          </div>
          <p className="text-2xl font-bold text-gray-800">{avgSale.toFixed(2)} MAD</p>
        </div>
      </div>

      {/* Sales per day */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <p className="font-medium text-gray-800 mb-4">Ventes par jour</p>
        {perDay.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune vente sur cette période.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {perDay.map(([day, value]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full"
                    style={{ width: `${(value / maxDay) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-24 text-right">
                  {value.toFixed(2)} MAD
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-medium text-gray-800">Meilleurs produits</p>
        </div>
        {topProducts.length === 0 ? (
          <p className="px-4 py-6 text-center text-gray-500 text-sm">Aucune donnée.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 text-right">Quantité vendue</th>
                <th className="px-4 py-3 text-right">Chiffre d&apos;affaires</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.qty}</td>
                  <td className="px-4 py-3 text-right font-medium">{p.revenue.toFixed(2)} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}