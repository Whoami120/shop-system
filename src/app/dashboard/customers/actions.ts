"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/audit";

export async function addCustomer(formData: FormData) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;
  

  if (!name) {
    redirect("/dashboard/customers?error=invalid");
  }

  await prisma.customer.create({
    data: {
      name: name,
      phone: phone || null,
      city: city || null,
      address: address || null,
      shopId: user.shopId,
    },
  });

  await logAction(user, "Client créé", name);
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers?ok=1");
}

export async function updateCustomer(formData: FormData) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const address = formData.get("address") as string;

  if (!name) {
    redirect("/dashboard/customers?error=invalid");
  }

  await prisma.customer.updateMany({
    where: { id: id, shopId: user.shopId },
    data: {
      name: name,
      phone: phone || null,
      city: city || null,
      address: address || null,
    },
  });

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers?ok=updated");
}

export async function deleteCustomer(formData: FormData) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);

  const id = formData.get("id") as string;

  // Detach sales from this customer first (keep the sales, just unlink)
  await prisma.sale.updateMany({
    where: { customerId: id, shopId: user.shopId },
    data: { customerId: null },
  });

  await prisma.customer.deleteMany({
    where: { id: id, shopId: user.shopId },
  });

  revalidatePath("/dashboard/customers");
}