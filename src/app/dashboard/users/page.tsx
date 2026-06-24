import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { createUser } from "./actions";
import Button from "@/components/Button";

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "CASHIER") return "Caissier";
  if (role === "STOCK") return "Stock";
  return role;
}

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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Utilisateurs</h1>

      {error === "taken" && (
        <p className="text-red-600 mb-3">
          Ce nom d&apos;utilisateur est déjà pris. Choisissez-en un autre.
        </p>
      )}
      {error === "invalid" && (
        <p className="text-red-600 mb-3">
          Données invalides. Remplissez tous les champs.
        </p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3">Utilisateur créé avec succès.</p>
      )}

      <form
        action={createUser}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 flex-wrap items-end mb-6"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom</label>
          <input
            type="text"
            name="name"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom d&apos;utilisateur</label>
          <input
            type="text"
            name="username"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Mot de passe</label>
          <input
            type="text"
            name="password"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Rôle</label>
          <select
            name="role"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          >
            <option value="CASHIER">Caissier</option>
            <option value="STOCK">Stock</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <Button type="submit">Créer</Button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Nom d&apos;utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">{roleLabel(u.role)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}