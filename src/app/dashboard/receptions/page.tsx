import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Truck, Package, Layers, Wallet, Plus, Eye } from "lucide-react";
import ReceptionsTable from "./ReceptionsTable";

export default async function ReceptionsPage() {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const receptions = await prisma.reception.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: { supplier: true, items: { include: { product: true } } },
  });

  // Stats
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = receptions.filter((r) => r.createdAt >= startOfToday).length;
  const totalItems = receptions.reduce((sum, r) => sum + r.items.length, 0);
  const totalQty = receptions.reduce(
    (sum, r) => sum + r.items.reduce((s, it) => s + it.quantity, 0),
    0
  );
  const totalValue = receptions.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Réceptions"
        breadcrumb={[{ label: "Achats" }, { label: "Réceptions" }]}
        action={
          <Link
            href="/dashboard/reception-new"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
          >
            <Plus size={16} /> Nouvelle réception
          </Link>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Truck size={20} />} label="Reçues aujourd'hui" value={String(todayCount)} color="blue" />
        <StatCard icon={<Package size={20} />} label="Produits reçus" value={String(totalItems)} color="green" />
        <StatCard icon={<Layers size={20} />} label="Quantité totale" value={String(totalQty)} color="amber" />
        <StatCard icon={<Wallet size={20} />} label="Valeur reçue (MAD)" value={totalValue.toFixed(2)} color="gray" />
      </div>

      {/* Table with search + pagination */}
      {receptions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Aucune réception pour le moment.
        </div>
      ) : (
        <ReceptionsTable
          rows={receptions.map((r, index) => ({
            id: r.id,
            number: `REC-${String(receptions.length - index).padStart(3, "0")}`,
            date: r.createdAt.toLocaleDateString("fr-FR"),
            supplier: r.supplier ? r.supplier.name : "-",
            itemsCount: r.items.length,
            total: r.total,
            products: r.items.map((it) => it.product.name).join(", "),
          }))}
        />
      )}
    </div>
  );
}