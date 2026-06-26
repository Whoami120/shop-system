import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Pos from "./Pos";

export default async function SalePage() {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Vente (caisse)"
        breadcrumb={[{ label: "Ventes" }, { label: "Caisse" }]}
      />
      <Pos
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          imageUrl: p.imageUrl,
        }))}
      />
    </div>
  );
}