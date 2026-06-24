import { syncUser } from "@/lib/syncUser";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Tableau de bord
      </h1>
      <p style={{ fontSize: "18px" }}>Bonjour, {user.name} 👋</p>
      <p style={{ color: "gray", marginTop: "10px" }}>
        Boutique : {user.shop.name}
      </p>
      <p style={{ color: "gray", marginTop: "5px" }}>Rôle : {user.role}</p>
    </div>
  );
}