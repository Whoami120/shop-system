"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addSupplier(formData: FormData) {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  if (!name) {
    redirect("/dashboard/suppliers?error=invalid");
  }

  await prisma.supplier.create({
    data: {
      name: name,
      phone: phone || null,
      city: city || null,
      shopId: user.shopId,
    },
  });

  revalidatePath("/dashboard/suppliers");
  redirect("/dashboard/suppliers?ok=1");
}

export async function updateSupplier(formData: FormData) {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  if (!name) {
    redirect("/dashboard/suppliers?error=invalid");
  }

  await prisma.supplier.updateMany({
    where: { id: id, shopId: user.shopId },
    data: {
      name: name,
      phone: phone || null,
      city: city || null,
    },
  });

  revalidatePath("/dashboard/suppliers");
  redirect("/dashboard/suppliers?ok=updated");
}

export async function deleteSupplier(formData: FormData) {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);

  const id = formData.get("id") as string;

  await prisma.supplier.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/suppliers");
}