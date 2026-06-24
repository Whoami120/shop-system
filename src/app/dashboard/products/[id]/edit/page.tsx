import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { updateProduct } from "../../actions";
import Button from "@/components/Button";
import Link from "next/link";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id: id, shopId: user.shopId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/products"
        className="text-brand text-sm hover:underline"
      >
        ← Retour aux produits
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">
        Modifier le produit
      </h1>

      <form
        action={updateProduct}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-sm"
      >
        <input type="hidden" name="id" value={product.id} />

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom</label>
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Prix (MAD)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            defaultValue={product.price}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Quantité</label>
          <input
            type="number"
            name="quantity"
            defaultValue={product.quantity}
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}