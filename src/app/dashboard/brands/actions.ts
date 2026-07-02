"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function addBrand(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const name = formData.get("name") as string;
  if (!name) {
    redirect("/dashboard/brands?error=invalid");
  }

  await prisma.brand.create({
    data: { name: name, shopId: user.shopId },
  });

  await logAction(user, "Marque créée", name);
  revalidatePath("/dashboard/brands");
  redirect("/dashboard/brands?ok=1");
}

export async function deleteBrand(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const id = formData.get("id") as string;

  // Detach products from this brand first
  await prisma.product.updateMany({
    where: { brandId: id, shopId: user.shopId },
    data: { brandId: null },
  });

  await prisma.brand.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/brands");
}