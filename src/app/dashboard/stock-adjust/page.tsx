import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { adjustStock } from "./actions";

export default async function StockAdjustPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("inventory", ["ADMIN"]);
  const { error, ok } = await searchParams;

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Ajustement de stock"
        breadcrumb={[{ label: "Inventaire" }, { label: "Ajustement" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Données invalides.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Stock ajusté avec succès.</p>
      )}

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Ajoutez d&apos;abord un produit.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-md">
          <form action={adjustStock} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-700">Produit</label>
              <select
                name="productId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (stock actuel : {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Nouvelle quantité (comptée)
              </label>
              <input
                type="number"
                name="newQuantity"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
                placeholder="ex : 47"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Raison (optionnel)</label>
              <input
                type="text"
                name="reason"
                placeholder="inventaire, correction, vol..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              />
            </div>

            <Button type="submit">Ajuster le stock</Button>
          </form>
        </div>
      )}
    </div>
  );
}