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

  // Correct! Create the session and go to dashboard
  await createSession(user.id);
  redirect("/dashboard");
}