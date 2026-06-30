import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import SalesHistoryClient from "./SalesHistoryClient";

export default async function SalesHistoryPage() {
  const user = await requireModule("sales", ["ADMIN"]);

  const sales = await prisma.sale.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Historique des ventes"
        breadcrumb={[{ label: "Ventes" }, { label: "Historique" }]}
      />

      <SalesHistoryClient
        rows={sales.map((s, index) => ({
          id: s.id,
          number: `VENTE-${String(sales.length - index).padStart(4, "0")}`,
          date: s.createdAt.toLocaleString("fr-FR"),
          cashier: s.user.name,
          itemsCount: s.items.length,
          total: s.total,
        }))}
      />
    </div>
  );
}