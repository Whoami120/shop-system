import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReceiptActions from "./ReceiptActions";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);
  const { id } = await params;

  const sale = await prisma.sale.findFirst({
    where: { id: id, shopId: user.shopId },
    include: {
      items: { include: { product: true } },
      user: true,
      shop: true,
    },
  });

  if (!sale) {
    notFound();
  }

  return (
    <div className="p-6">
      {/* Action buttons (hidden when printing) */}
      <div className="print:hidden">
        <ReceiptActions />
      </div>

      {/* The ticket */}
      <div
        id="ticket"
        className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm mx-auto mt-4"
      >
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">{sale.shop.name}</h1>
          {sale.shop.address && (
            <p className="text-xs text-gray-500 mt-1">{sale.shop.address}</p>
          )}
          {sale.shop.phone && (
            <p className="text-xs text-gray-500">Tél : {sale.shop.phone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Ticket de vente</p>
        </div>

        <div className="text-xs text-gray-600 border-b border-dashed border-gray-300 pb-3 mb-3">
          <div className="flex justify-between">
            <span>Date :</span>
            <span>{sale.createdAt.toLocaleString("fr-FR")}</span>
          </div>
          <div className="flex justify-between">
            <span>Caissier :</span>
            <span>{sale.user.name}</span>
          </div>
          <div className="flex justify-between">
            <span>N° :</span>
            <span>{sale.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
              <th className="py-1">Produit</th>
              <th className="py-1 text-center">Qté</th>
              <th className="py-1 text-right">Prix</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-1.5">{item.product.name}</td>
                <td className="py-1.5 text-center">{item.quantity}</td>
                <td className="py-1.5 text-right">{item.price.toFixed(2)}</td>
                <td className="py-1.5 text-right">
                  {(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
          <span className="font-bold text-gray-800">TOTAL</span>
          <span className="font-bold text-lg text-gray-800">
            {sale.total.toFixed(2)} MAD
          </span>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          {sale.shop.receiptFooter || "Merci de votre visite 🙏"}
        </p>
      </div>
    </div>
  );
}