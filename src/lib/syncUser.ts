import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

// Reads the logged-in user from our session.
export async function syncUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  });

  return user;
}