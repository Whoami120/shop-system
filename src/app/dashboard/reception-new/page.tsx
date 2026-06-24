import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import ReceptionForm from "./ReceptionForm";

export default async function NewReceptionPage() {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const products = await prisma.product.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Nouvelle réception
      </h1>
      <ReceptionForm products={products} suppliers={suppliers} />
    </div>
  );
}