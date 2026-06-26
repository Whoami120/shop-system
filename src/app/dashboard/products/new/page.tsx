import { requireModule } from "@/lib/requireAdmin";
import PageHeader from "@/components/PageHeader";
import ProductForm from "./ProductForm";
import Link from "next/link";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireModule("inventory", ["ADMIN", "STOCK"]);
  const { error } = await searchParams;

  return (
    <div className="p-6">
      <Link href="/dashboard/products" className="text-brand text-sm hover:underline">
        ← Retour aux produits
      </Link>

      <div className="mt-3 mb-6">
        <PageHeader
          title="Nouveau produit"
          breadcrumb={[{ label: "Inventaire" }, { label: "Produits" }, { label: "Nouveau" }]}
        />
      </div>

      {error === "invalid" && (
        <p className="text-red-600 mb-4">Remplissez les champs obligatoires.</p>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-3xl">
        <ProductForm />
      </div>
    </div>
  );
}