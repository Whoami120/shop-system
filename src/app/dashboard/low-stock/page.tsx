import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { AlertTriangle, Pencil } from "lucide-react";

export default async function LowStockPage() {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { quantity: "asc" },
  });

  const lowStock = products.filter((p) => p.quantity <= p.lowStockLevel);

  return (
    <div className="p-6">
      <PageHeader
        title="Stock bas"
        breadcrumb={[{ label: "Inventaire" }, { label: "Stock bas" }]}
      />

      {lowStock.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <p className="text-gray-800 font-medium">Tout va bien</p>
          <p className="text-gray-500 text-sm mt-1">Aucun produit en stock bas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Stock actuel</th>
                <th className="px-4 py-3">Alerte</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.lowStockLevel}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}