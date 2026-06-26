import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OwnerHomePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  await requireSuperAdmin();
  const { created } = await searchParams;

  // Get all shops, with how many users and modules each has
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, shopModules: true },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Boutiques</h1>
        <Link
          href="/owner/new-shop"
          className="px-4 py-2 rounded-md text-white bg-brand hover:bg-brand-dark transition-colors"
        >
          + Nouvelle boutique
        </Link>
      </div>

      {shops.length === 0 ? (
        <p className="text-gray-500">Aucune boutique.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {created === "1" && (
            <p className="text-green-600 mb-4">Boutique créée avec succès.</p>
            )}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Utilisateurs</th>
                <th className="px-4 py-3">Modules actifs</th>
                <th className="px-4 py-3">Créée le</th>
                <th className="px-4 py-3">Gérer</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{shop.name}</td>
                  <td className="px-4 py-3">{shop._count.users}</td>
                  <td className="px-4 py-3">{shop._count.shopModules}</td>
                  <td className="px-4 py-3">
                    {shop.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/owner/shops/${shop.id}`}
                      className="text-brand hover:underline"
                    >
                      Gérer
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