"use server";

import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Each line the user added
type Line = {
  productId: string;
  quantity: number;
  purchasePrice: number;
};

export async function createReception(
  supplierId: string | null,
  lines: Line[]
) {
  const user = await requireRole(["ADMIN", "STOCK"]);

  // Must have at least one valid line
  const validLines = lines.filter(
    (l) => l.productId && l.quantity > 0 && l.purchasePrice >= 0
  );
  if (validLines.length === 0) {
    throw new Error("No valid lines");
  }

  // Total = sum of (quantity * purchasePrice)
  let total = 0;
  for (const l of validLines) {
    total += l.quantity * l.purchasePrice;
  }

  // Do everything together safely:
  await prisma.$transaction(async (tx) => {
    // 1. Create the reception document
    const reception = await tx.reception.create({
      data: {
        total: total,
        shopId: user.shopId,
        supplierId: supplierId || null,
      },
    });

    // 2. For each line: create the item, raise stock, save a StockMove
    for (const l of validLines) {
      await tx.receptionItem.create({
        data: {
          receptionId: reception.id,
          productId: l.productId,
          quantity: l.quantity,
          purchasePrice: l.purchasePrice,
        },
      });

      await tx.product.update({
        where: { id: l.productId },
        data: { quantity: { increment: l.quantity } },
      });

      await tx.stockMove.create({
        data: {
          type: "RECEPTION",
          quantity: l.quantity,
          productId: l.productId,
          shopId: user.shopId,
          userId: user.id,
        },
      });
    }
  });

  redirect("/dashboard/receptions");
}