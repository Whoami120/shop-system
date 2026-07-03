import { requireModule } from "@/lib/requireAdmin";
import PageHeader from "@/components/PageHeader";
import ImportClient from "./ImportClient";

export default async function ImportPage() {
  await requireModule("inventory", ["ADMIN"]);

  return (
    <div className="p-6">
      <PageHeader
        title="Importer des produits"
        breadcrumb={[{ label: "Inventaire" }, { label: "Import" }]}
      />

      <div className="bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl p-4 mb-5 max-w-lg text-sm text-blue-800 dark:text-slate-200">
        <p className="font-medium mb-1">Format du fichier</p>
        <p>
          Le fichier CSV doit avoir une première ligne d&apos;en-têtes avec ces colonnes :
        </p>
        <p className="mt-2 font-mono text-xs bg-white dark:bg-slate-900 rounded px-2 py-1 border border-blue-100 dark:border-slate-700">
          name,price,purchasePrice,quantity,barcode,category,brand
        </p>
        <p className="mt-2 text-blue-700 dark:text-slate-300">
          Seul <strong>name</strong> est obligatoire. Laissez les autres vides si besoin.
          Les catégories et marques inexistantes seront créées automatiquement.
        </p>
      </div>

      <ImportClient />
    </div>
  );
}