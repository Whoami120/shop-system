import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import AddProductForm from "./AddProductForm";
import { deleteProduct } from "./actions";
import Link from "next/link";
import Button from "@/components/Button";

export default async function ProductsPage() {
  const user = await requireRole(["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Produits</h1>

      <AddProductForm />

      {products.length === 0 ? (
        <p className="text-gray-500">
          Aucun produit pour le moment. Ajoutez votre premier produit.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Prix (MAD)</th>
                <th className="px-4 py-3">Quantité</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="px-3 py-1.5 rounded-md text-white text-sm bg-brand hover:bg-brand-dark transition-colors"
                      >
                        Modifier
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <Button variant="danger" className="px-3 py-1.5 text-sm">
                          Supprimer
                        </Button>
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