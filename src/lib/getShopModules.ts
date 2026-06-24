import { prisma } from "@/lib/prisma";

// Returns the list of enabled module keys for a shop, e.g. ["dashboard", "sales"]
export async function getShopModules(shopId: string): Promise<string[]> {
  const shopModules = await prisma.shopModule.findMany({
    where: { shopId: shopId, enabled: true },
    include: { module: true },
  });

  return shopModules.map((sm) => sm.module.key);
}