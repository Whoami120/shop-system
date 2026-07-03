"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function adjustStock(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN"]);

  const productId = formData.get("productId") as string;
  const newQuantity = parseInt(formData.get("newQuantity") as string);
  const reason = formData.get("reason") as string;

  if (!productId || isNaN(newQuantity) || newQuantity < 0) {
    redirect("/dashboard/stock-adjust?error=invalid");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: user.shopId },
  });
  if (!product) {
    redirect("/dashboard/stock-adjust?error=notfound");
  }

  const difference = newQuantity - product.quantity;

  // Update the product to the new total, and log the move
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    });

    await tx.stockMove.create({
      data: {
        type: "ADJUSTMENT",
        quantity: Math.abs(difference),
        reason:
          (difference >= 0 ? "Ajout" : "Retrait") +
          " (" +
          product.quantity +
          " → " +
          newQuantity +
          ")" +
          (reason ? " - " + reason : ""),
        productId: productId,
        shopId: user.shopId,
        userId: user.id,
      },
    });
  });

  await logAction(
    user,
    "Stock ajusté",
    product.name + " : " + product.quantity + " → " + newQuantity
  );

  revalidatePath("/dashboard/stock-adjust");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/stock-adjust?ok=1");
}