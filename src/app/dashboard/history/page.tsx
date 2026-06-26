import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const user = await requireModule("inventory", ["ADMIN"]);

  const moves = await prisma.stockMove.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: { product: true, user: true },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Historique des mouvements"
        breadcrumb={[{ label: "Inventaire" }, { label: "Historique" }]}
      />

      <HistoryClient
        moves={moves.map((m) => ({
          id: m.id,
          date: m.createdAt.toLocaleString("fr-FR"),
          type: m.type,
          product: m.product.name,
          quantity: m.quantity,
          reason: m.reason || "",
          user: m.user.name,
        }))}
      />
    </div>
  );
}