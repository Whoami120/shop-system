import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireModule("sales", ["ADMIN", "CASHIER"]);
  const { error, ok } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { shopId: user.shopId },
    orderBy: { name: "asc" },
    include: { _count: { select: { sales: true } } },
  });

  return (
    <div className="p-6">
      <PageHeader
        title="Clients"
        breadcrumb={[{ label: "Ventes" }, { label: "Clients" }]}
      />

      {error === "invalid" && (
        <p className="text-red-600 mb-3 text-sm">Le nom est obligatoire.</p>
      )}
      {ok === "1" && (
        <p className="text-green-600 mb-3 text-sm">Client ajouté.</p>
      )}
      {ok === "updated" && (
        <p className="text-green-600 mb-3 text-sm">Client modifié.</p>
      )}

      <CustomersClient
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          city: c.city,
          address: c.address,
          salesCount: c._count.sales,
        }))}
      />
    </div>
  );
}