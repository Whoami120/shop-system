"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function receiveStock(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);

  if (!productId || isNaN(quantity) || quantity <= 0) {
    throw new Error("Invalid data");
  }

  // Make sure the product belongs to this shop
  const product = await prisma.product.findFirst({
    where: { id: productId, shopId: user.shopId },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  // Do BOTH together so they never get out of sync:
  // 1. add to product quantity
  // 2. save the stock move record
  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: { increment: quantity } },
    }),
    prisma.stockMove.create({
      data: {
        type: "RECEPTION",
        quantity: quantity,
        productId: productId,
        shopId: user.shopId,
        userId: user.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/reception");
  revalidatePath("/dashboard/products");
}