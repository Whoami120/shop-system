import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { recordSale } from "./actions";

export default async function SalePage() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Vente (caisse)
      </h1>

      {products.length === 0 ? (
        <p style={{ color: "gray" }}>Ajoutez d&apos;abord un produit.</p>
      ) : (
        <form
          action={recordSale}
          style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "320px" }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", marginBottom: "4px" }}>Produit</label>
            <select
              name="productId"
              required
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price} MAD (stock : {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "14px", marginBottom: "4px" }}>Quantité</label>
            <input
              type="number"
              name="quantity"
              min="1"
              required
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#2980b9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Vendre
          </button>
        </form>
      )}
    </div>
  );
}