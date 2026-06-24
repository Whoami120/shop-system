import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

function typeLabel(type: string) {
  if (type === "RECEPTION") return "Réception";
  if (type === "SALE") return "Vente";
  if (type === "BROKEN") return "Cassé / perdu";
  return type;
}

function typeColor(type: string) {
  if (type === "RECEPTION") return "text-green-600";
  if (type === "SALE") return "text-brand";
  if (type === "BROKEN") return "text-orange-600";
  return "text-gray-600";
}

export default async function HistoryPage() {
  const user = await requireAdmin();

  const moves = await prisma.stockMove.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: { product: true, user: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Historique des mouvements
      </h1>

      {moves.length === 0 ? (
        <p className="text-gray-500">Aucun mouvement pour le moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Quantité</th>
                <th className="px-4 py-3">Raison</th>
                <th className="px-4 py-3">Par</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => (
                <tr key={move.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3">
                    {move.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className={`px-4 py-3 font-medium ${typeColor(move.type)}`}>
                    {typeLabel(move.type)}
                  </td>
                  <td className="px-4 py-3">{move.product.name}</td>
                  <td className="px-4 py-3">{move.quantity}</td>
                  <td className="px-4 py-3">{move.reason || "-"}</td>
                  <td className="px-4 py-3">{move.user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}