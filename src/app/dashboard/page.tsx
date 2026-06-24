import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-44">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  const shopId = user.shopId;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaySales = await prisma.stockMove.findMany({
    where: {
      shopId: shopId,
      type: "SALE",
      createdAt: { gte: startOfToday },
    },
    include: { product: true },
  });

  let todaySalesTotal = 0;
  for (const sale of todaySales) {
    todaySalesTotal += sale.quantity * sale.product.price;
  }

  const products = await prisma.product.findMany({
    where: { shopId: shopId },
  });

  let stockValue = 0;
  for (const p of products) {
    stockValue += p.price * p.quantity;
  }

  const lowStock = products.filter((p) => p.quantity <= 5);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">
        Bonjour, {user.name} — {user.shop.name}
      </p>

      {/* Cards */}
      <div className="flex gap-4 flex-wrap mb-10">
        <Card title="Ventes aujourd'hui (MAD)" value={todaySalesTotal.toFixed(2)} />
        <Card title="Ventes aujourd'hui (nombre)" value={String(todaySales.length)} />
        <Card title="Nombre de produits" value={String(products.length)} />
        <Card title="Valeur du stock (MAD)" value={stockValue.toFixed(2)} />
      </div>

      {/* Low stock */}
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Produits en stock bas
      </h2>
      {lowStock.length === 0 ? (
        <p className="text-gray-500">Aucun produit en stock bas. 👍</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Quantité restante</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}