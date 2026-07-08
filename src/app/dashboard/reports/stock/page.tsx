import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { Package, Wallet, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import PrintButton from "../PrintButton";

export default async function StockReportPage() {
  const user = await requireModule("inventory", ["ADMIN"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // Totals
  let costValue = 0;
  let sellingValue = 0;
  for (const p of products) {
    costValue += p.purchasePrice * p.quantity;
    sellingValue += p.price * p.quantity;
  }
  const potentialMargin = sellingValue - costValue;

  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockLevel);
  const outOfStock = products.filter((p) => p.quantity <= 0);

  // Value by category (cost + selling)
  const catMap = new Map<string, { cost: number; selling: number; count: number }>();
  for (const p of products) {
    const name = p.category ? p.category.name : "Sans catégorie";
    const prev = catMap.get(name) || { cost: 0, selling: 0, count: 0 };
    prev.cost += p.purchasePrice * p.quantity;
    prev.selling += p.price * p.quantity;
    prev.count += 1;
    catMap.set(name, prev);
  }
  const byCategory = Array.from(catMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.selling - a.selling);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.selling));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          title="Rapport de stock"
          breadcrumb={[{ label: "Rapports" }, { label: "Stock" }]}
        />
        <PrintButton />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Wallet size={16} className="text-blue-500" /> Valeur d&apos;achat
          </div>
          <p className="text-xl font-bold text-gray-800">{costValue.toFixed(2)} MAD</p>
          <p className="text-xs text-gray-400 mt-0.5">Ce que vous avez investi</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp size={16} className="text-green-500" /> Valeur de vente
          </div>
          <p className="text-xl font-bold text-gray-800">{sellingValue.toFixed(2)} MAD</p>
          <p className="text-xs text-gray-400 mt-0.5">Si tout est vendu</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Package size={16} className="text-purple-500" /> Marge potentielle
          </div>
          <p className="text-xl font-bold text-gray-800">{potentialMargin.toFixed(2)} MAD</p>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} produit(s)</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle size={16} className="text-orange-500" /> Alertes
          </div>
          <p className="text-xl font-bold text-gray-800">
            {lowStock.length} <span className="text-sm font-normal text-gray-500">bas</span>
            {" · "}
            {outOfStock.length} <span className="text-sm font-normal text-gray-500">rupture</span>
          </p>
        </div>
      </div>

      {/* Value by category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <p className="font-medium text-gray-800 mb-4">Valeur du stock par catégorie</p>
        {byCategory.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun produit.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {byCategory.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-32 truncate">{c.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full"
                    style={{ width: `${(c.selling / maxCat) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-28 text-right">
                  {c.selling.toFixed(2)} MAD
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Out of stock */}
      {outOfStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mb-6">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <XCircle size={16} className="text-red-500" />
            <p className="font-medium text-gray-800">Produits en rupture</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {outOfStock.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.category ? p.category.name : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <p className="font-medium text-gray-800">Stock bas</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Alerte</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{p.lowStockLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}