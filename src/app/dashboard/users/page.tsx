import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import UsersClient from "./UsersClient";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const admin = await requireModule("settings", ["ADMIN"]);
  const { error, ok } = await searchParams;

  const users = await prisma.user.findMany({
    where: { shopId: admin.shopId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Utilisateurs"
        breadcrumb={[{ label: "Paramètres" }, { label: "Utilisateurs" }]}
      />

      {error === "taken" && (
        <p className="text-red-600 mb-3 text-sm">Ce nom d&apos;utilisateur est déjà pris.</p>
      )}
      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Données invalides.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Utilisateur créé avec succès.</p>
      )}

      <UsersClient
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role,
        }))}
      />
    </div>
  );
}