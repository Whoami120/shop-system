"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function addCategory(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const name = formData.get("name") as string;
  if (!name) {
    redirect("/dashboard/categories?error=invalid");
  }

  await prisma.category.create({
    data: { name: name, shopId: user.shopId },
  });

  await logAction(user, "Catégorie créée", name);
  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories?ok=1");
}

export async function deleteCategory(formData: FormData) {
  const user = await requireModule("inventory", ["ADMIN", "STOCK"]);

  const id = formData.get("id") as string;

  // Detach products from this category first (set categoryId to null)
  await prisma.product.updateMany({
    where: { categoryId: id, shopId: user.shopId },
    data: { categoryId: null },
  });

  await prisma.category.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/categories");
}