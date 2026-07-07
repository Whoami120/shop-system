import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import InvoiceActions from "./InvoiceActions";
import RefundButton from "./RefundButton";

function unitLabel(unit: string) {
  const map: Record<string, string> = {
    piece: "pièce",
    kg: "kg",
    litre: "litre",
    carton: "carton",
    metre: "mètre",
  };
  return map[unit] || unit;
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN"]);
  const { id } = await params;

  const sale = await prisma.sale.findFirst({
    where: { id: id, shopId: user.shopId },
    include: {
      items: { include: { product: true } },
      user: true,
      shop: true,
      customer: true,
    },
  });

  if (!sale) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="print:hidden mb-4 flex items-center justify-between">
        <Link href="/dashboard/sales-history" className="text-brand text-sm hover:underline">
          ← Retour à l&apos;historique
        </Link>
        <div className="flex items-center gap-3">
          <RefundButton saleId={sale.id} alreadyRefunded={sale.refunded} />
          <InvoiceActions />
        </div>
      </div>

      {/* Invoice sheet */}
      <div
        id="invoice"
        className="bg-white text-gray-800 border border-gray-200 rounded-xl p-8 max-w-3xl mx-auto shadow-sm"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sale.shop.name}</h1>
            {sale.shop.address && <p className="text-sm text-gray-500 mt-1">{sale.shop.address}</p>}
            {sale.shop.phone && <p className="text-sm text-gray-500">Tél : {sale.shop.phone}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-700">FACTURE</h2>
            {sale.refunded && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                Remboursée
              </span>
            )}
            <p className="text-sm text-gray-500 mt-1">
              N° {sale.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              {sale.createdAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="mb-6 text-sm text-gray-600">
          {sale.customer && (
            <p>Client : <span className="font-medium text-gray-800">{sale.customer.name}</span></p>
          )}
          <p>Caissier : <span className="font-medium text-gray-800">{sale.user.name}</span></p>
        </div>

        {/* Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left text-xs text-gray-500 uppercase">
              <th className="py-2">Désignation</th>
              <th className="py-2 text-center">Qté</th>
              <th className="py-2 text-right">Prix unit.</th>
              <th className="py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3">{item.product.name}</td>
                <td className="py-3 text-center">
                  {item.quantity} {unitLabel(item.product.unit)}
                </td>
                <td className="py-3 text-right">{item.price.toFixed(2)}</td>
                <td className="py-3 text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-t-2 border-gray-300">
              <span className="font-bold text-gray-800">TOTAL</span>
              <span className="font-bold text-lg text-gray-900">
                {sale.total.toFixed(2)} MAD
              </span>
            </div>
          </div>
        </div>

        {sale.shop.receiptFooter && (
          <p className="text-center text-sm text-gray-400 mt-10 border-t border-gray-100 pt-6">
            {sale.shop.receiptFooter}
          </p>
        )}
      </div>
    </div>
  );
}