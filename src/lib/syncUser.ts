import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// This checks if the logged-in person exists in our database.
// If not, it creates a new Shop and a new User (as ADMIN).
export async function syncUser() {
  const clerkUser = await currentUser();

  // No one is logged in
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0].emailAddress;

  // 1. Look for this user in our database (by email)
  let user = await prisma.user.findUnique({
    where: { email },
    include: { shop: true },
  });

  // 2. If found, return it
  if (user) {
    return user;
  }

  // 3. If NOT found, this is a new person.
  //    Create a new Shop and make them the ADMIN.
  const newShop = await prisma.shop.create({
    data: {
      name: "Ma boutique", // default shop name, can be changed later
    },
  });

  user = await prisma.user.create({
    data: {
      name: clerkUser.firstName || email,
      email: email,
      password: "managed_by_clerk", // Clerk handles real passwords
      role: "ADMIN",
      shopId: newShop.id,
    },
    include: { shop: true },
  });

  return user;
}