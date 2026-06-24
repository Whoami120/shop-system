import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// The catalog of all modules in the system
const MODULES = [
  { key: "dashboard", label: "Tableau de bord", description: "Vue d'ensemble" },
  { key: "inventory", label: "Inventaire", description: "Produits et stock" },
  { key: "sales", label: "Ventes", description: "Caisse et ventes" },
  { key: "purchases", label: "Achats", description: "Fournisseurs et réceptions" },
  { key: "settings", label: "Paramètres", description: "Utilisateurs et réglages" },
];

async function main() {
  // 1. Create modules in the catalog (skip if already there)
  for (const m of MODULES) {
    await prisma.module.upsert({
      where: { key: m.key },
      update: { label: m.label, description: m.description },
      create: { key: m.key, label: m.label, description: m.description },
    });
  }
  console.log("✅ Modules catalog ready.");

  // 2. Give EVERY existing shop ALL modules (so nothing breaks)
  const shops = await prisma.shop.findMany();
  const allModules = await prisma.module.findMany();

  for (const shop of shops) {
    for (const module of allModules) {
      await prisma.shopModule.upsert({
        where: {
          shopId_moduleId: { shopId: shop.id, moduleId: module.id },
        },
        update: { enabled: true },
        create: { shopId: shop.id, moduleId: module.id, enabled: true },
      });
    }
  }
  console.log(`✅ Gave all modules to ${shops.length} shop(s).`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));