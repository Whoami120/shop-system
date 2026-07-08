import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { TrendingUp, Wallet, Receipt, PiggyBank } from "lucide-react";
import PrintButton from "../PrintButton";

export default async function ProfitReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireModule("dashboard", ["ADMIN"]);
  const { range } = await searchParams;
  const selected = range || "month";

  // Date range
  const now = new Date();
  let start = new Date();
  if (selected === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (selected === "week") {
    start.setDate(now.getDate() - 7);
  } else if (selected === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (selected === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  }

  // Sales in range (not refunded) with items + product cost
  const sales = await prisma.sale.findMany({
    where: {
      shopId: user.shopId,
      refunded: false,
      createdAt: { gte: start },
    },
    include: { items: { include: { product: true } } },
  });

  // Revenue and cost of goods sold
  let revenue = 0;
  let costOfGoods = 0;
  for (const s of sales) {
    revenue += s.total;
    for (const item of s.items) {
      costOfGoods += item.product.purchasePrice * item.quantity;
    }
  }
  const grossProfit = revenue - costOfGoods;

  // Expenses in range
  const expenses = await prisma.expense.findMany({
    where: { shopId: user.shopId, createdAt: { gte: start } },
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = grossProfit - totalExpenses;

  const ranges = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "7 jours" },
    { key: "month", label: "Ce mois" },
    { key: "year", label: "Cette année" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          title="Rapport de bénéfice"
          breadcrumb={[{ label: "Rapports" }, { label: "Bénéfice" }]}
        />
        <PrintButton />
      </div>

      {/* Range filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ranges.map((r) => (
          <Link
            key={r.key}
            href={`/dashboard/reports/profit?range=${r.key}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              selected === r.key
                ? "bg-brand text-white border-brand"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex flex-col gap-4">
          {/* Revenue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp size={18} className="text-blue-500" />
              <span>Chiffre d&apos;affaires (ventes)</span>
            </div>
            <span className="font-medium text-gray-800">{revenue.toFixed(2)} MAD</span>
          </div>

          {/* Cost of goods */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Wallet size={18} className="text-orange-500" />
              <span>Coût des marchandises vendues</span>
            </div>
            <span className="font-medium text-red-600">− {costOfGoods.toFixed(2)} MAD</span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Gross profit */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800">Bénéfice brut</span>
            <span className="font-bold text-gray-800">{grossProfit.toFixed(2)} MAD</span>
          </div>

          {/* Expenses */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Receipt size={18} className="text-purple-500" />
              <span>Dépenses</span>
            </div>
            <span className="font-medium text-red-600">− {totalExpenses.toFixed(2)} MAD</span>
          </div>

          <div className="border-t-2 border-gray-300" />

          {/* Net profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank size={20} className={netProfit >= 0 ? "text-green-600" : "text-red-600"} />
              <span className="font-bold text-lg text-gray-800">Bénéfice net</span>
            </div>
            <span className={`font-bold text-2xl ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netProfit.toFixed(2)} MAD
            </span>
          </div>
        </div>
      </div>

      {/* Small explainer */}
      <p className="text-xs text-gray-400 mt-4 max-w-2xl">
        Bénéfice net = ventes − coût des marchandises − dépenses. Le coût utilise le prix
        d&apos;achat actuel de chaque produit.
      </p>
    </div>
  );
}