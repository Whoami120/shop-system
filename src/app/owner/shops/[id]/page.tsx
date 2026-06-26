import { requireSuperAdmin } from "@/lib/requireSuperAdmin";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ModuleToggle from "./ModuleToggle";

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;

  const shop = await prisma.shop.findUnique({
    where: { id: id },
  });

  if (!shop) {
    notFound();
  }

  // Get all modules in the catalog
  const allModules = await prisma.module.findMany({
    orderBy: { label: "asc" },
  });

  // Get this shop's module settings
  const shopModules = await prisma.shopModule.findMany({
    where: { shopId: id },
  });

  // Helper: is a module enabled for this shop?
  function isEnabled(moduleId: string) {
    const sm = shopModules.find((s) => s.moduleId === moduleId);
    return sm ? sm.enabled : false;
  }

  return (
    <div className="p-8">
      <Link href="/owner" className="text-brand text-sm hover:underline">
        ← Retour aux boutiques
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-1">{shop.name}</h1>
      <p className="text-gray-500 text-sm mb-6">Gérer les modules de cette boutique</p>

      <div className="flex flex-col gap-3 max-w-2xl">
        {allModules.map((module) => (
          <ModuleToggle
            key={module.id}
            shopId={shop.id}
            moduleId={module.id}
            label={module.label}
            description={module.description}
            initialEnabled={isEnabled(module.id)}
          />
        ))}
      </div>
    </div>
  );
}