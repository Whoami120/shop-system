import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id: id, shopId: user.shopId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6">
      <Link href="/dashboard/products" className="text-brand text-sm hover:underline">
        ← Retour aux produits
      </Link>

      <div className="mt-3 mb-6">
        <PageHeader
          title="Modifier le produit"
          breadcrumb={[{ label: "Inventaire" }, { label: "Produits" }, { label: "Modifier" }]}
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-3xl">
        <EditProductForm
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            imageUrl: product.imageUrl,
            tva: product.tva,
          }}
        />
      </div>
    </div>
  );
}