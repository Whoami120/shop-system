import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { addCategory, deleteCategory } from "./actions";
import { Trash2 } from "lucide-react";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);
  const { error, ok } = await searchParams;

  const categories = await prisma.category.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Catégories"
        breadcrumb={[{ label: "Inventaire" }, { label: "Catégories" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Le nom est obligatoire.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Catégorie ajoutée.</p>
      )}

      {/* Add form */}
      <form
        action={addCategory}
        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-3 items-end mb-6 max-w-md"
      >
        <div className="flex-1">
          <label className="text-sm text-gray-700">Nom de la catégorie</label>
          <input
            type="text"
            name="name"
            required
            placeholder="ex : Boissons"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
          />
        </div>
        <Button type="submit">Ajouter</Button>
      </form>

      {/* List */}
      {categories.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Aucune catégorie pour le moment.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Produits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
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