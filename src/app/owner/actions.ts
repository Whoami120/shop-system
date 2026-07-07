"use server";

import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteShop(formData: FormData) {
  await requireSuperAdmin();

  const shopId = formData.get("shopId") as string;
  if (!shopId) return;

  // Never delete a shop that has a SUPERADMIN (the owner's own shop)
  const superadmin = await prisma.user.findFirst({
    where: { shopId, role: "SUPERADMIN" },
  });
  if (superadmin) {
    return;
  }

  // Delete all the shop's data in the right order (children first)
  await prisma.customerTransaction.deleteMany({ where: { shopId } });
  await prisma.saleItem.deleteMany({ where: { sale: { shopId } } });
  await prisma.sale.deleteMany({ where: { shopId } });
  await prisma.stockMove.deleteMany({ where: { shopId } });
  await prisma.receptionItem.deleteMany({ where: { reception: { shopId } } });
  await prisma.reception.deleteMany({ where: { shopId } });
  await prisma.customer.deleteMany({ where: { shopId } });
  await prisma.product.deleteMany({ where: { shopId } });
  await prisma.category.deleteMany({ where: { shopId } });
  await prisma.brand.deleteMany({ where: { shopId } });
  await prisma.supplier.deleteMany({ where: { shopId } });
  await prisma.auditLog.deleteMany({ where: { shopId } });
  await prisma.shopModule.deleteMany({ where: { shopId } });

  // Delete users EXCEPT superadmins (extra safety)
  await prisma.user.deleteMany({
    where: { shopId, role: { not: "SUPERADMIN" } },
  });

  // Finally, the shop itself
  await prisma.shop.deleteMany({ where: { id: shopId } });

  revalidatePath("/owner");
}