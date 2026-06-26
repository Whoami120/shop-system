import { syncUser } from "@/lib/syncUser";
import { redirect } from "next/navigation";

// Allow only the SaaS owner (SUPERADMIN).
export async function requireSuperAdmin() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }
  return user;
}