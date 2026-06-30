import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, Calendar } from "lucide-react";

export default async function ReceptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);
  const { id } = await params;

  const reception = await prisma.reception.findFirst({
    where: { id: id, shopId: user.shopId },
    include: { supplier: true, items: { include: { product: true } } },
  });

  if (!reception) {
    notFound();
  }

  return (
    <div className="p-6">
      <Link href="/dashboard/receptions" className="text-brand text-sm hover:underline">
        ← Retour aux réceptions
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-4">Bon de réception</h1>

      {/* Info card */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-5 flex flex-wrap gap-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck size={18} className="text-brand" />
          <span>Fournisseur :</span>
          <span className="font-medium text-gray-800">
            {reception.supplier ? reception.supplier.name : "-"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={18} className="text-brand" />
          <span>Date :</span>
          <span className="font-medium text-gray-800">
            {reception.createdAt.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Prix d&apos;achat (MAD)</th>
              <th className="px-4 py-3">Sous-total (MAD)</th>
            </tr>
          </thead>
          <tbody>
            {reception.items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 text-sm">
                <td className="px-4 py-3 font-medium">{item.product.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.purchasePrice.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {(item.quantity * item.purchasePrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">
                Total :
              </td>
              <td className="px-4 py-3 font-bold text-brand">
                {reception.total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}