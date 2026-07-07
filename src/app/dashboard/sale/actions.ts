"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CartLine = {
  productId: string;
  quantity: number;
};

export async function checkout(
  lines: CartLine[],
  customerId?: string | null,
  amountPaid?: number | null
) {
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
        customerId: customerId || null,
      },
    });

    // If a customer is set and they didn't pay the full amount,
    // add the unpaid part to their balance (credit).
    if (customerId && amountPaid != null) {
      const creditAmount = total - amountPaid;
      if (creditAmount > 0) {
        await tx.customerTransaction.create({
          data: {
            type: "CREDIT",
            amount: creditAmount,
            note:
              amountPaid > 0
                ? `Vente: payé ${amountPaid.toFixed(2)}, crédit ${creditAmount.toFixed(2)}`
                : "Vente à crédit",
            customerId: customerId,
            shopId: user.shopId,
            userId: user.id,
          },
        });
      }
    }

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

export async function refundSale(saleId: string) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const sale = await prisma.sale.findFirst({
    where: { id: saleId, shopId: user.shopId },
    include: { items: true },
  });
  if (!sale) {
    throw new Error("Vente introuvable");
  }
  if (sale.refunded) {
    throw new Error("Cette vente est déjà remboursée");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Return each item's stock + log a REFUND move
    for (const item of sale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
      await tx.stockMove.create({
        data: {
          type: "REFUND",
          quantity: item.quantity,
          reason: "Remboursement vente",
          productId: item.productId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    }

    // 2. Mark the sale as refunded
    await tx.sale.update({
      where: { id: saleId },
      data: { refunded: true },
    });

    // 3. If it was a credit sale, reverse the customer's debt (a PAYMENT of the total)
    if (sale.customerId) {
      await tx.customerTransaction.create({
        data: {
          type: "PAYMENT",
          amount: sale.total,
          method: null,
          note: "Remboursement vente",
          customerId: sale.customerId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    }
  });

  revalidatePath("/dashboard/sales-history");
  revalidatePath("/dashboard/products");
}