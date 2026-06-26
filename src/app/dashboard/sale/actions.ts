"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CartLine = {
  productId: string;
  quantity: number;
};

export async function checkout(lines: CartLine[]) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  // Keep only valid lines
  const valid = lines.filter((l) => l.productId && l.quantity > 0);
  if (valid.length === 0) {
    throw new Error("Panier vide");
  }

  // Check stock for every line first
  for (const line of valid) {
    const product = await prisma.product.findFirst({
      where: { id: line.productId, shopId: user.shopId },
    });
    if (!product) {
      throw new Error("Produit introuvable");
    }
    if (product.quantity < line.quantity) {
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }
  }

  // Build the lines with the current price, and compute total
  const detailed: { productId: string; quantity: number; price: number }[] = [];
  for (const line of valid) {
    const product = await prisma.product.findFirst({
      where: { id: line.productId, shopId: user.shopId },
    });
    if (product) {
      detailed.push({
        productId: line.productId,
        quantity: line.quantity,
        price: product.price,
      });
    }
  }

  let total = 0;
  for (const d of detailed) {
    total += d.price * d.quantity;
  }

  // Sell everything together (safe transaction) and create the Sale
  const saleId = await prisma.$transaction(async (tx) => {
    // 1. Create the facture
    const sale = await tx.sale.create({
      data: {
        total: total,
        shopId: user.shopId,
        userId: user.id,
      },
    });

    // 2. For each line: save sale item, lower stock, save StockMove
    for (const d of detailed) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: d.productId,
          quantity: d.quantity,
          price: d.price,
        },
      });

      await tx.product.update({
        where: { id: d.productId },
        data: { quantity: { decrement: d.quantity } },
      });

      await tx.stockMove.create({
        data: {
          type: "SALE",
          quantity: d.quantity,
          productId: d.productId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    }

    return sale.id;
  });

  revalidatePath("/dashboard/sale");
  revalidatePath("/dashboard/products");

  return saleId;
}