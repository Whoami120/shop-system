import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ReceptionForm from "./ReceptionForm";

export default async function NewReceptionPage() {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { name: "asc" },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <Link href="/dashboard/receptions" className="text-brand text-sm hover:underline">
        ← Retour aux réceptions
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Nouvelle réception"
          breadcrumb={[{ label: "Achats" }, { label: "Réceptions" }, { label: "Nouvelle" }]}
        />
      </div>

      <ReceptionForm products={products} suppliers={suppliers} />
    </div>
  );
}