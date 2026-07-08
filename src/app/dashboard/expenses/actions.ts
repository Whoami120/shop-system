"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function addExpense(formData: FormData) {
  const user = await requireModule("dashboard", ["ADMIN"]);

  const label = formData.get("label") as string;
  const category = formData.get("category") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const note = formData.get("note") as string;

  if (!label || isNaN(amount) || amount <= 0) {
    redirect("/dashboard/expenses?error=invalid");
  }

  await prisma.expense.create({
    data: {
      label: label,
      category: category || "autre",
      amount: amount,
      note: note || null,
      shopId: user.shopId,
      userId: user.id,
    },
  });

  await logAction(user, "Dépense ajoutée", label + " : " + amount.toFixed(2) + " MAD");
  revalidatePath("/dashboard/expenses");
  redirect("/dashboard/expenses?ok=1");
}

export async function deleteExpense(formData: FormData) {
  const user = await requireModule("dashboard", ["ADMIN"]);

  const id = formData.get("id") as string;

  await prisma.expense.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/expenses");
}