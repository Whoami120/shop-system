import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { recordPayment } from "../actions";
import { Phone, MapPin, Building2 } from "lucide-react";

function methodLabel(m: string | null) {
  if (m === "espece") return "Espèce";
  if (m === "cheque") return "Chèque";
  if (m === "virement") return "Virement";
  return "-";
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);
  const { id } = await params;
  const { error, ok } = await searchParams;

  const customer = await prisma.customer.findFirst({
    where: { id: id, shopId: user.shopId },
    include: {
      transactions: { orderBy: { createdAt: "desc" } },
      sales: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) {
    notFound();
  }

  // Calculate everything from the ledger (never stored)
  let totalCredit = 0;
  let totalPaid = 0;
  for (const t of customer.transactions) {
    if (t.type === "CREDIT") totalCredit += t.amount;
    else if (t.type === "PAYMENT") totalPaid += t.amount;
  }
  const balance = totalCredit - totalPaid;

  const totalOrders = customer.sales.reduce((sum, s) => sum + s.total, 0);
  const lastPayment = customer.transactions.find((t) => t.type === "PAYMENT");

  return (
    <div className="p-6">
      <Link href="/dashboard/customers" className="text-brand text-sm hover:underline">
        ← Retour aux clients
      </Link>

      <div className="mt-3 mb-6">
        <PageHeader
          title={customer.name}
          breadcrumb={[{ label: "Ventes" }, { label: "Clients" }, { label: customer.name }]}
        />
      </div>

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Montant invalide.</p>
      )}
      {ok === "payment" && (
        <p className="text-green-600 mb-3 text-sm">Paiement enregistré.</p>
      )}

      {/* Info + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Info card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="font-medium text-gray-800 mb-3">Informations</p>
          {customer.phone && (
            <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Phone size={14} className="text-gray-400" /> {customer.phone}
            </p>
          )}
          {customer.city && (
            <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Building2 size={14} className="text-gray-400" /> {customer.city}
            </p>
          )}
          {customer.address && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-gray-400" /> {customer.address}
            </p>
          )}
        </div>

        {/* Balance card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Solde dû</p>
          <p className={`text-3xl font-bold mt-1 ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
            {balance.toFixed(2)} <span className="text-lg">MAD</span>
          </p>
          <div className="mt-3 text-xs text-gray-500 space-y-0.5">
            <p>Total commandes : {totalOrders.toFixed(2)} MAD</p>
            <p>Total à crédit : {totalCredit.toFixed(2)} MAD</p>
            <p>Total payé : {totalPaid.toFixed(2)} MAD</p>
            {lastPayment && (
              <p>Dernier paiement : {lastPayment.createdAt.toLocaleDateString("fr-FR")}</p>
            )}
          </div>
        </div>

        {/* Record payment card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="font-medium text-gray-800 mb-3">Enregistrer un paiement</p>
          <form action={recordPayment} className="flex flex-col gap-2">
            <input type="hidden" name="customerId" value={customer.id} />
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              required
              placeholder="Montant"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
            />
            <select
              name="method"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
            >
              <option value="espece">Espèce</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
            </select>
            <input
              type="text"
              name="note"
              placeholder="Note (optionnel)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
            >
              Encaisser le paiement
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="font-medium text-gray-800">Historique (crédits & paiements)</p>
        </div>
        {customer.transactions.length === 0 ? (
          <p className="px-4 py-6 text-center text-gray-500 text-sm">Aucune transaction.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Méthode</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {customer.transactions.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 text-gray-600">
                    {t.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {t.type === "CREDIT" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                        Crédit
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        Paiement
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.type === "PAYMENT" ? methodLabel(t.method) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.note || "-"}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.type === "CREDIT" ? "text-red-600" : "text-green-600"}`}>
                    {t.type === "CREDIT" ? "+" : "−"}{t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}