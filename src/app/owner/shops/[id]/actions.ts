"use server";

import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Turn a module ON or OFF for a shop
export async function toggleModule(
  shopId: string,
  moduleId: string,
  enable: boolean
) {
  await requireSuperAdmin();

  if (enable) {
    // Turn on: create the link if missing, or set enabled = true
    await prisma.shopModule.upsert({
      where: {
        shopId_moduleId: { shopId: shopId, moduleId: moduleId },
      },
      update: { enabled: true },
      create: { shopId: shopId, moduleId: moduleId, enabled: true },
    });
  } else {
    // Turn off: set enabled = false (keep the row)
    await prisma.shopModule.updateMany({
      where: { shopId: shopId, moduleId: moduleId },
      data: { enabled: false },
    });
  }

  revalidatePath(`/owner/shops/${shopId}`);
}