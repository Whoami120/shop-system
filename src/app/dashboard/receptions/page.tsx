import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReceptionsPage() {
  const user = await requireRole(["ADMIN", "STOCK"]);

  const receptions = await prisma.reception.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: { supplier: true, items: true },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Réceptions</h1>
        <Link
          href="/dashboard/reception-new"
          className="px-4 py-2 rounded-md text-white bg-brand hover:bg-brand-dark transition-colors"
        >
          + Nouvelle réception
        </Link>
      </div>

      {receptions.length === 0 ? (
        <p className="text-gray-500">Aucune réception pour le moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Nb produits</th>
                <th className="px-4 py-3">Total (MAD)</th>
                <th className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {receptions.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3">
                    {r.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">{r.supplier ? r.supplier.name : "-"}</td>
                  <td className="px-4 py-3">{r.items.length}</td>
                  <td className="px-4 py-3 font-medium">{r.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/receptions/${r.id}`}
                      className="text-brand hover:underline"
                    >
                      Voir
                    </Link>
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