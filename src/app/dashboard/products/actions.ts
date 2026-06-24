"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addProduct(formData: FormData) {
  // Make sure user is logged in
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  // Read values from the form
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);

  // Simple check
  if (!name || isNaN(price) || isNaN(quantity)) {
    throw new Error("Invalid data");
  }

  // Save the product for THIS shop
  await prisma.product.create({
    data: {
      name: name,
      price: price,
      quantity: quantity,
      shopId: user.shopId,
    },
  });

  // Refresh the products page so the new product shows
  revalidatePath("/dashboard/products");
}
export async function deleteProduct(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const id = formData.get("id") as string;

  // Delete ONLY if the product belongs to this user's shop (safety)
  await prisma.product.deleteMany({
    where: {
      id: id,
      shopId: user.shopId,
    },
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

  if (!name || isNaN(price) || isNaN(quantity)) {
    throw new Error("Invalid data");
  }

  // Update ONLY if it belongs to this user's shop (safety)
  await prisma.product.updateMany({
    where: {
      id: id,
      shopId: user.shopId,
    },
    data: {
      name: name,
      price: price,
      quantity: quantity,
    },
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}