"use server";

import { requireRole } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addSupplier(formData: FormData) {
  // Admin or Stock can manage suppliers
  const user = await requireRole(["ADMIN", "STOCK"]);

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  if (!name) {
    redirect("/dashboard/suppliers?error=invalid");
  }

  await prisma.supplier.create({
    data: {
      name: name,
      phone: phone || null,
      shopId: user.shopId,
    },
  });

  revalidatePath("/dashboard/suppliers");
  redirect("/dashboard/suppliers?ok=1");
}

export async function deleteSupplier(formData: FormData) {
  const user = await requireRole(["ADMIN", "STOCK"]);

  const id = formData.get("id") as string;

  // Delete only if it belongs to this shop
  await prisma.supplier.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/suppliers");
}