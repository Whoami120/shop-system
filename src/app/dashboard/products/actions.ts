"use server";

import { syncUser } from "@/lib/syncUser";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function addProduct(formData: FormData) {
  const user = await syncUser();
  if (!user) {
    throw new Error("Not logged in");
  }

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
  const quantity = parseInt(formData.get("quantity") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const tva = parseInt(formData.get("tva") as string) || 0;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const unit = (formData.get("unit") as string) || "piece";
  const barcode = formData.get("barcode") as string;
  const lowStockLevel = parseInt(formData.get("lowStockLevel") as string) || 5;

  if (!name || isNaN(price) || isNaN(quantity)) {
    redirect("/dashboard/products/new?error=invalid");
  }

  await prisma.product.create({
    data: {
      name: name,
      price: price,
      purchasePrice: purchasePrice,
      quantity: quantity,
      imageUrl: imageUrl || null,
      tva: tva,
      categoryId: categoryId || null,
      brandId: brandId || null,
      unit: unit,
      barcode: barcode || null,
      shopId: user.shopId,
      lowStockLevel: lowStockLevel,
    },
  });

  await logAction(user, "Produit créé", name);

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

  await logAction(user, "Produit archivé", id);

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
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
  const quantity = parseInt(formData.get("quantity") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const tva = parseInt(formData.get("tva") as string) || 0;
  const categoryId = formData.get("categoryId") as string;
  const brandId = formData.get("brandId") as string;
  const unit = (formData.get("unit") as string) || "piece";
  const barcode = formData.get("barcode") as string;
  const lowStockLevel = parseInt(formData.get("lowStockLevel") as string) || 5;

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
      purchasePrice: purchasePrice,
      quantity: quantity,
      imageUrl: imageUrl || null,
      tva: tva,
      categoryId: categoryId || null,
      brandId: brandId || null,
      unit: unit,
      barcode: barcode || null,
      lowStockLevel: lowStockLevel,
    },
  });

  await logAction(user, "Produit modifié", name);

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}