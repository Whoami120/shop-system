import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { addExpense, deleteExpense } from "./actions";
import { Trash2 } from "lucide-react";

const CATEGORIES = ["loyer", "électricité", "eau", "internet", "salaires", "carburant", "autre"];

function catLabel(c: string) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("dashboard", ["ADMIN"]);
  const { error, ok } = await searchParams;

  // This month's range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const expenses = await prisma.expense.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
  });

  const monthExpenses = expenses.filter((e) => e.createdAt >= startOfMonth);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Dépenses"
        breadcrumb={[{ label: "Tableau de bord" }, { label: "Dépenses" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Remplissez le libellé et un montant valide.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Dépense ajoutée.</p>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-lg">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Ce mois-ci</p>
          <p className="text-2xl font-bold text-gray-800">{monthTotal.toFixed(2)} MAD</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{allTotal.toFixed(2)} MAD</p>
        </div>
      </div>

      {/* Add form */}
      <form
        action={addExpense}
        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end mb-6"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Libellé</label>
          <input
            type="text"
            name="label"
            required
            placeholder="ex : Loyer janvier"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Catégorie</label>
          <select
            name="category"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {catLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Montant (MAD)</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            required
            placeholder="0.00"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand w-32"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-40">
          <label className="text-sm text-gray-700">Note (optionnel)</label>
          <input
            type="text"
            name="note"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>
        <Button type="submit">Ajouter</Button>
      </form>

      {/* List */}
      {expenses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Aucune dépense pour le moment.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 text-gray-600">
                    {e.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-medium">{e.label}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {catLabel(e.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.note || "-"}</td>
                  <td className="px-4 py-3 text-right font-medium">{e.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <form action={deleteExpense}>
                        <input type="hidden" name="id" value={e.id} />
                        <button
                          type="submit"
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}