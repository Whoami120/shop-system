"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function recordReturn(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN", "CASHIER"]);

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const condition = formData.get("condition") as string; // "stock" or "damaged"
  const reason = formData.get("reason") as string;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    redirect("/dashboard/returns?error=invalid");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: user.shopId },
  });
  if (!product) {
    redirect("/dashboard/returns?error=notfound");
  }

  const backToStock = condition !== "damaged"; // default: back to stock

  await prisma.$transaction(async (tx) => {
    if (backToStock) {
      // Good return: increase stock
      await tx.product.update({
        where: { id: productId },
        data: { quantity: { increment: quantity } },
      });
      await tx.stockMove.create({
        data: {
          type: "RETURN",
          quantity: quantity,
          reason: "Retour en stock" + (reason ? " - " + reason : ""),
          productId: productId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    } else {
      // Damaged return: does not go back to sellable stock, logged as broken
      await tx.stockMove.create({
        data: {
          type: "BROKEN",
          quantity: quantity,
          reason: "Retour endommagé" + (reason ? " - " + reason : ""),
          productId: productId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    }
  });

  await logAction(
    user,
    "Retour produit",
    product.name + " x" + quantity + (backToStock ? " (en stock)" : " (endommagé)")
  );

  revalidatePath("/dashboard/returns");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/returns?ok=1");
}