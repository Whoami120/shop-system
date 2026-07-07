import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Suppression des données de test...");

  // Delete in order (children first, then parents)
  await prisma.customerTransaction.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.stockMove.deleteMany({});
  await prisma.receptionItem.deleteMany({});
  await prisma.reception.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.shopModule.deleteMany({});

  // Delete all users EXCEPT superadmins
  await prisma.user.deleteMany({
    where: { role: { not: "SUPERADMIN" } },
  });

  // Delete all shops that have no users left (i.e. all shops, since only superadmin users remain and they aren't tied to a deletable shop)
  // First, find shops that still have a superadmin — keep those; delete the rest.
  const shopsWithSuperadmin = await prisma.user.findMany({
    where: { role: "SUPERADMIN" },
    select: { shopId: true },
  });
  const keepShopIds = shopsWithSuperadmin.map((u) => u.shopId);

  await prisma.shop.deleteMany({
    where: { id: { notIn: keepShopIds } },
  });

  console.log("Terminé. Seuls les SUPERADMIN et leur boutique restent.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });