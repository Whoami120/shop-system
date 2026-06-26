import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import SuppliersClient from "./SuppliersClient";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("purchases", ["ADMIN", "STOCK"]);
  const { error, ok } = await searchParams;

  const suppliers = await prisma.supplier.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Fournisseurs"
        breadcrumb={[{ label: "Achats" }, { label: "Fournisseurs" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Le nom est obligatoire.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Fournisseur ajouté avec succès.</p>
      )}
      {ok === "updated" && (
        <p className="text-green-600 mb-3 text-sm">Fournisseur modifié avec succès.</p>
      )}

      <SuppliersClient
        suppliers={suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          city: s.city,
        }))}
      />
    </div>
  );
}