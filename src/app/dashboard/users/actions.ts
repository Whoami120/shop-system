"use server";

import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function createUser(formData: FormData) {
  // Only admin can create users
  const admin = await requireAdmin();

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  // Simple checks
  if (!name || !username || !password || !role) {
    throw new Error("Invalid data");
  }

  // Role must be one of the allowed values
  if (role !== "ADMIN" && role !== "CASHIER" && role !== "STOCK") {
    throw new Error("Invalid role");
  }

  // Is the username already taken?
  const existing = await prisma.user.findUnique({
    where: { username: username },
  });
  if (existing) {
    redirect("/dashboard/users?error=taken");
  }

  // Hash the password safely
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the worker IN THE ADMIN'S SHOP
  await prisma.user.create({
    data: {
      name: name,
      username: username,
      password: hashedPassword,
      role: role as "ADMIN" | "CASHIER" | "STOCK",
      shopId: admin.shopId,
    },
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?ok=1");
}