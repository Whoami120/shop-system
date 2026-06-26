"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/login?error=1");
  }

  // Find the user by username
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  // If no user, or wrong password → error
  if (!user) {
    redirect("/login?error=1");
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    redirect("/login?error=1");
  }

  // Correct! Create the session
  await createSession(user.id);

  // Send each role to their home page
  if (user.role === "SUPERADMIN") {
    redirect("/owner");
  }
  if (user.role === "ADMIN") {
    redirect("/dashboard");
  }
  if (user.role === "CASHIER") {
    redirect("/dashboard/sale");
  }
  if (user.role === "STOCK") {
    redirect("/dashboard/products");
  }
  // fallback
  redirect("/dashboard/sale");
}