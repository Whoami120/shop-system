import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "./ProductGrid";
import { Plus } from "lucide-react";

export default async function ProductsPage() {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Produits"
        breadcrumb={[{ label: "Inventaire" }, { label: "Produits" }]}
        action={
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> Nouveau
          </Link>
        }
      />

      <ProductGrid
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          imageUrl: p.imageUrl,
          tva: p.tva,
        }))}
      />
    </div>
  );
}