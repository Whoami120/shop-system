"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const tva = parseInt(formData.get("tva") as string) || 0;

  if (!name || isNaN(price) || isNaN(quantity)) {
    redirect("/dashboard/products/new?error=invalid");
  }

  await prisma.product.create({
    data: {
      name: name,
      price: price,
      quantity: quantity,
      imageUrl: imageUrl || null,
      tva: tva,
      shopId: user.shopId,
    },
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}
export async function deleteProduct(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const id = formData.get("id") as string;

  // Archive instead of delete (keeps history safe)
  await prisma.product.updateMany({
    where: {
      id: id,
      shopId: user.shopId,
    },
    data: { active: false },
  });

  revalidatePath("/dashboard/products");
}
export async function updateProduct(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const tva = parseInt(formData.get("tva") as string) || 0;

  if (!name || isNaN(price) || isNaN(quantity)) {
    redirect(`/dashboard/products/${id}/edit?error=invalid`);
  }

  await prisma.product.updateMany({
    where: {
      id: id,
      shopId: user.shopId,
    },
    data: {
      name: name,
      price: price,
      quantity: quantity,
      imageUrl: imageUrl || null,
      tva: tva,
    },
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}