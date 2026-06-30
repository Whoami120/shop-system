"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateShopSettings(formData: FormData) {
  const user = await requireModule("settings", ["ADMIN"]);

  const name = formData.get("name") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const receiptFooter = formData.get("receiptFooter") as string;

  if (!name) {
    redirect("/dashboard/settings?error=invalid");
  }

  await prisma.shop.update({
    where: { id: user.shopId },
    data: {
      name: name,
      imageUrl: imageUrl || null,
      address: address || null,
      phone: phone || null,
      receiptFooter: receiptFooter || null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  redirect("/dashboard/settings?ok=1");
}