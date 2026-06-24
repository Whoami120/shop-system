import { syncUser } from "@/lib/syncUser";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get (or create) the user in our database
  const user = await syncUser();

  // If not logged in, send to sign-in page
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div style={{ padding: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Tableau de bord
        </h1>
        <UserButton />
      </div>

      <p style={{ fontSize: "18px" }}>Bonjour, {user.name} 👋</p>
      <p style={{ color: "gray", marginTop: "10px" }}>
        Boutique : {user.shop.name}
      </p>
      <p style={{ color: "gray", marginTop: "5px" }}>
        Rôle : {user.role}
      </p>
    </div>
  );
}