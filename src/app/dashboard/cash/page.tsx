import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { Wallet } from "lucide-react";

export default async function CashPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN"]);
  const { date } = await searchParams;

  const day = date ? new Date(date) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  // Sales today (not refunded) → positive lines
  const sales = await prisma.sale.findMany({
    where: {
      shopId: user.shopId,
      createdAt: { gte: start, lte: end },
      refunded: false,
    },
    include: { customer: true },
  });

  // Customer payments today (credit repayments) → positive lines
  const payments = await prisma.customerTransaction.findMany({
    where: {
      shopId: user.shopId,
      type: "PAYMENT",
      createdAt: { gte: start, lte: end },
    },
    include: { customer: true },
  });

  // Refunds today → negative lines
  const refunds = await prisma.sale.findMany({
    where: {
      shopId: user.shopId,
      refunded: true,
      createdAt: { gte: start, lte: end },
    },
    include: { customer: true },
  });

  // Build one unified journal
  type Entry = {
    time: Date;
    name: string;
    label: string;
    amount: number; // negative for refunds
  };

  const entries: Entry[] = [];

  for (const s of sales) {
    entries.push({
      time: s.createdAt,
      name: s.customer?.name || "Comptoir",
      label: "Vente",
      amount: s.total,
    });
  }
  for (const p of payments) {
    entries.push({
      time: p.createdAt,
      name: p.customer?.name || "-",
      label: "Paiement crédit",
      amount: p.amount,
    });
  }
  for (const r of refunds) {
    entries.push({
      time: r.createdAt,
      name: r.customer?.name || "Comptoir",
      label: "Remboursement",
      amount: -r.total,
    });
  }

  // Sort by time
  entries.sort((a, b) => a.time.getTime() - b.time.getTime());

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  const dayLabel = day.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Journal de caisse"
        breadcrumb={[{ label: "Ventes" }, { label: "Caisse" }]}
      />

      <p className="text-sm text-gray-500 mb-5 capitalize">{dayLabel}</p>

      {/* Total card */}
      <div className="bg-brand text-white rounded-xl p-5 shadow-sm mb-6 max-w-sm">
        <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
          <Wallet size={16} /> Total caisse du jour
        </div>
        <p className="text-3xl font-bold">{total.toFixed(2)} MAD</p>
      </div>

      {/* Unified journal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {entries.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-500 text-sm">
            Aucun mouvement aujourd&apos;hui.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Heure</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 text-gray-600">
                    {e.time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        e.label === "Remboursement"
                          ? "bg-red-50 text-red-700"
                          : e.label === "Paiement crédit"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {e.label}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      e.amount < 0 ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {e.amount < 0 ? "" : "+"}
                    {e.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">
                  Total :
                </td>
                <td className="px-4 py-3 text-right font-bold text-brand">
                  {total.toFixed(2)} MAD
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}