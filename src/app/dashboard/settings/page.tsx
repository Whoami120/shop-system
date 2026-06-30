import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import { updateShopSettings } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("settings", ["ADMIN"]);
  const { error, ok } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { id: user.shopId },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Paramètres de la boutique"
        breadcrumb={[{ label: "Paramètres" }, { label: "Boutique" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Le nom est obligatoire.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Paramètres enregistrés.</p>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-2xl">
        <form action={updateShopSettings} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-700">
              Nom de la boutique <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={shop?.name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Image de fond (URL)</label>
            <input
              type="text"
              name="imageUrl"
              defaultValue={shop?.imageUrl || ""}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
            />
            {shop?.imageUrl && (
              <img
                src={shop.imageUrl}
                alt="aperçu"
                className="mt-2 h-24 w-full max-w-xs object-cover rounded-md border border-gray-200"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Téléphone</label>
              <input
                type="text"
                name="phone"
                defaultValue={shop?.phone || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Adresse</label>
              <input
                type="text"
                name="address"
                defaultValue={shop?.address || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">
              Message en bas du ticket
            </label>
            <input
              type="text"
              name="receiptFooter"
              defaultValue={shop?.receiptFooter || ""}
              placeholder="Merci de votre visite"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
            />
          </div>

          <div className="mt-2">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}