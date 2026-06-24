import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  // Find this product, only within the user's shop
  const product = await prisma.product.findFirst({
    where: { id: id, shopId: user.shopId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Modifier le produit
      </h1>

      <form
        action={updateProduct}
        style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "300px" }}
      >
        <input type="hidden" name="id" value={product.id} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "14px", marginBottom: "4px" }}>Nom</label>
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            required
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "14px", marginBottom: "4px" }}>Prix (MAD)</label>
          <input
            type="number"
            name="price"
            step="0.01"
            defaultValue={product.price}
            required
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "14px", marginBottom: "4px" }}>Quantité</label>
          <input
            type="number"
            name="quantity"
            defaultValue={product.quantity}
            required
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#111",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}