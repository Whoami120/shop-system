import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddProductForm from "./AddProductForm";
import { deleteProduct } from "./actions";
import Link from "next/link";

export default async function ProductsPage() {
  // Make sure the user is logged in and in our database
  const user = await syncUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get all products that belong to THIS user's shop
  const products = await prisma.product.findMany({
    where: { shopId: user.shopId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Produits
      </h1>

      <AddProductForm />

      {products.length === 0 ? (
        <p style={{ color: "gray" }}>
          Aucun produit pour le moment. Ajoutez votre premier produit.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px" }}>Nom</th>
              <th style={{ padding: "10px" }}>Prix (MAD)</th>
              <th style={{ padding: "10px" }}>Quantité</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{product.name}</td>
                <td style={{ padding: "10px" }}>{product.price}</td>
                <td style={{ padding: "10px" }}>{product.quantity}</td>
                <td style={{ padding: "10px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      style={{
                        padding: "6px 12px",
                        background: "#2980b9",
                        color: "white",
                        borderRadius: "6px",
                        textDecoration: "none",
                      }}
                    >
                      Modifier
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        style={{
                          padding: "6px 12px",
                          background: "#c0392b",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}