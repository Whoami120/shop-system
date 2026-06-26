import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { createShop } from "./actions";
import Button from "@/components/Button";
import Link from "next/link";

export default async function NewShopPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireSuperAdmin();
  const { error } = await searchParams;

  return (
    <div className="p-8">
      <Link href="/owner" className="text-brand text-sm hover:underline">
        ← Retour aux boutiques
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">
        Nouvelle boutique
      </h1>

      {error === "invalid" && (
        <p className="text-red-600 mb-3">Remplissez tous les champs.</p>
      )}
      {error === "taken" && (
        <p className="text-red-600 mb-3">
          Ce nom d&apos;utilisateur est déjà pris.
        </p>
      )}

      <form
        action={createShop}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-md"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom de la boutique</label>
          <input
            type="text"
            name="shopName"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <hr className="border-gray-200" />
        <p className="text-sm font-medium text-gray-600">Premier administrateur</p>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom</label>
          <input
            type="text"
            name="adminName"
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

        <Button type="submit">Créer la boutique</Button>
      </form>
    </div>
  );
}