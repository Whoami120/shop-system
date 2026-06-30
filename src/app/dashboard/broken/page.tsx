import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { recordBroken } from "./actions";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";

export default async function BrokenPage() {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Produit cassé / perdu"
        breadcrumb={[{ label: "Inventaire" }, { label: "Cassé / perdu" }]}
      />

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Ajoutez d&apos;abord un produit.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-md">
          <form action={recordBroken} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-700">Produit</label>
              <select
                name="productId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (stock : {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">Quantité</label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Raison</label>
              <input
                type="text"
                name="reason"
                placeholder="cassé, périmé, perdu..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              />
            </div>

            <Button type="submit">Enregistrer</Button>
          </form>
        </div>
      )}
    </div>
  );
}