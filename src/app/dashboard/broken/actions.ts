"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordBroken(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const reason = formData.get("reason") as string;

  if (!productId || isNaN(quantity) || quantity <= 0 || !reason) {
    throw new Error("Invalid data");
  }

  // Make sure the product belongs to this shop
  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: user.shopId },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  // Cannot remove more than we have
  if (product.quantity < quantity) {
    throw new Error("Not enough stock");
  }

  // Do BOTH together: lower the stock AND save the move
  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: { decrement: quantity } },
    }),
    prisma.stockMove.create({
      data: {
        type: "BROKEN",
        quantity: quantity,
        reason: reason,
        productId: productId,
        shopId: user.shopId,
        userId: user.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/broken");
  revalidatePath("/dashboard/products");
}