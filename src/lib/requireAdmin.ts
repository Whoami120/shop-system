import { syncUser } from "@/lib/syncUser";
import { redirect } from "next/navigation";
import { getShopModules } from "@/lib/getShopModules";

// Allow only an admin.
export async function requireAdmin() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

// Allow only the roles in the list. Example: requireRole(["ADMIN", "STOCK"])
export async function requireRole(allowedRoles: string[]) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

// Allow only if: role is allowed AND the shop has the module enabled
export async function requireModule(
  moduleKey: string,
  allowedRoles: string[]
) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  const enabledModules = await getShopModules(user.shopId);
  if (!enabledModules.includes(moduleKey)) {
    redirect("/dashboard");
  }

  return user;
}