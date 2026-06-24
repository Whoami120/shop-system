import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

// ====== CHANGE THESE 4 VALUES ======
const SHOP_NAME = "Ma boutique";
const ADMIN_NAME = "Khalid";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
// ===================================

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check if this username already exists
  const existing = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existing) {
    console.log("⚠️  This username already exists. Nothing created.");
    return;
  }

  // Create the shop
  const shop = await prisma.shop.create({
    data: { name: SHOP_NAME },
  });

  // Hash the password safely
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create the admin user
  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      password: hashedPassword,
      role: "ADMIN",
      shopId: shop.id,
    },
  });

  console.log("✅ Admin created!");
  console.log("   Username:", ADMIN_USERNAME);
  console.log("   Password:", ADMIN_PASSWORD);
  console.log("   Shop:", SHOP_NAME);
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));