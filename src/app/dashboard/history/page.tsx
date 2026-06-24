import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Turn the move type into a French label
function typeLabel(type: string) {
  if (type === "RECEPTION") return "Réception";
  if (type === "SALE") return "Vente";
  if (type === "BROKEN") return "Cassé / perdu";
  return type;
}

export default async function HistoryPage() {
  const user = await syncUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get all moves for this shop, newest first.
  // Also bring the product name and the user name.
  const moves = await prisma.stockMove.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      user: true,
    },
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Historique des mouvements
      </h1>

      {moves.length === 0 ? (
        <p style={{ color: "gray" }}>Aucun mouvement pour le moment.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Type</th>
              <th style={{ padding: "10px" }}>Produit</th>
              <th style={{ padding: "10px" }}>Quantité</th>
              <th style={{ padding: "10px" }}>Raison</th>
              <th style={{ padding: "10px" }}>Par</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr key={move.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>
                  {move.createdAt.toLocaleString("fr-FR")}
                </td>
                <td style={{ padding: "10px" }}>{typeLabel(move.type)}</td>
                <td style={{ padding: "10px" }}>{move.product.name}</td>
                <td style={{ padding: "10px" }}>{move.quantity}</td>
                <td style={{ padding: "10px" }}>{move.reason || "-"}</td>
                <td style={{ padding: "10px" }}>{move.user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}