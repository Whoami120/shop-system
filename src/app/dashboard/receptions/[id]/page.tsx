import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ReceptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN", "STOCK"]);
  const { id } = await params;

  const reception = await prisma.reception.findFirst({
    where: { id: id, shopId: user.shopId },
    include: { supplier: true, items: { include: { product: true } } },
  });

  if (!reception) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/receptions"
        className="text-brand text-sm hover:underline"
      >
        ← Retour aux réceptions
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-1">
        Bon de réception
      </h1>
      <p className="text-gray-500 text-sm">
        Date : {reception.createdAt.toLocaleString("fr-FR")}
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Fournisseur : {reception.supplier ? reception.supplier.name : "-"}
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Prix d&apos;achat (MAD)</th>
              <th className="px-4 py-3">Sous-total (MAD)</th>
            </tr>
          </thead>
          <tbody>
            {reception.items.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 text-sm">
                <td className="px-4 py-3">{item.product.name}</td>
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
              <td colSpan={3} className="px-4 py-3 text-right font-bold">
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