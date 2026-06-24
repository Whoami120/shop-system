import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { recordBroken } from "./actions";
import Button from "@/components/Button";

export default async function BrokenPage() {
  const user = await requireRole(["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Produit cassé / perdu
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">Ajoutez d&apos;abord un produit.</p>
      ) : (
        <form
          action={recordBroken}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-sm"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Produit</label>
            <select
              name="productId"
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock : {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Quantité</label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Raison</label>
            <input
              type="text"
              name="reason"
              placeholder="cassé, périmé, perdu..."
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
            />
          </div>

          <Button type="submit">Enregistrer</Button>
        </form>
      )}
    </div>
  );
}