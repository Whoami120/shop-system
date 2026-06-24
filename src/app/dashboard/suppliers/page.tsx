import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { addSupplier, deleteSupplier } from "./actions";
import Button from "@/components/Button";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireRole(["ADMIN", "STOCK"]);
  const { error, ok } = await searchParams;

  const suppliers = await prisma.supplier.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fournisseurs</h1>

      {error === "invalid" && (
        <p className="text-red-600 mb-3">Le nom est obligatoire.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3">Fournisseur ajouté avec succès.</p>
      )}

      <form
        action={addSupplier}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 flex-wrap items-end mb-6"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom</label>
          <input
            type="text"
            name="name"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Téléphone</label>
          <input
            type="text"
            name="phone"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <Button type="submit">Ajouter</Button>
      </form>

      {suppliers.length === 0 ? (
        <p className="text-gray-500">Aucun fournisseur pour le moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <form action={deleteSupplier}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button variant="danger" className="px-3 py-1.5 text-sm">
                        Supprimer
                      </Button>
                    </form>
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