"use server";

import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// The modules a new shop starts with
const DEFAULT_MODULES = ["dashboard", "inventory", "sales"];

export async function createShop(formData: FormData) {
  await requireSuperAdmin();

  const shopName = formData.get("shopName") as string;
  const adminName = formData.get("adminName") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Check all fields
  if (!shopName || !adminName || !username || !password) {
    redirect("/owner/new-shop?error=invalid");
  }

  // Username must be unique
  const existing = await prisma.user.findUnique({
    where: { username: username },
  });
  if (existing) {
    redirect("/owner/new-shop?error=taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Get the default modules from the catalog
  const modules = await prisma.module.findMany({
    where: { key: { in: DEFAULT_MODULES } },
  });

  // Create everything together safely
  await prisma.$transaction(async (tx) => {
    // 1. Create the shop
    const shop = await tx.shop.create({
      data: { name: shopName },
    });

    // 2. Create its first admin
    await tx.user.create({
      data: {
        name: adminName,
        username: username,
        password: hashedPassword,
        role: "ADMIN",
        shopId: shop.id,
      },
    });

    // 3. Give the shop its default modules
    for (const module of modules) {
      await tx.shopModule.create({
        data: {
          shopId: shop.id,
          moduleId: module.id,
          enabled: true,
        },
      });
    }
  });

  redirect("/owner?created=1");
}