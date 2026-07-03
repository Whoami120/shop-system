"use server";

import { requireModule } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

// Simple CSV line splitter that respects quotes
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function importProducts(
  prevState: unknown,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const user = await requireModule("inventory", ["ADMIN"]);

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { ok: false, message: "Aucun fichier sélectionné." };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) {
    return { ok: false, message: "Le fichier est vide ou n'a pas de données." };
  }

  // First line = headers. Map header names to positions.
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = {
    name: headers.indexOf("name"),
    price: headers.indexOf("price"),
    purchasePrice: headers.indexOf("purchaseprice"),
    quantity: headers.indexOf("quantity"),
    barcode: headers.indexOf("barcode"),
    category: headers.indexOf("category"),
    brand: headers.indexOf("brand"),
  };

  if (idx.name === -1) {
    return { ok: false, message: "Colonne 'name' introuvable dans le fichier." };
  }

  // Cache categories & brands so we don't create duplicates
  const catCache = new Map<string, string>();
  const brandCache = new Map<string, string>();

  async function getCategoryId(nameRaw: string): Promise<string | null> {
    const name = nameRaw.trim();
    if (!name) return null;
    const key = name.toLowerCase();
    if (catCache.has(key)) return catCache.get(key)!;
    let cat = await prisma.category.findFirst({
      where: { shopId: user.shopId, name: name },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: name, shopId: user.shopId },
      });
    }
    catCache.set(key, cat.id);
    return cat.id;
  }

  async function getBrandId(nameRaw: string): Promise<string | null> {
    const name = nameRaw.trim();
    if (!name) return null;
    const key = name.toLowerCase();
    if (brandCache.has(key)) return brandCache.get(key)!;
    let brand = await prisma.brand.findFirst({
      where: { shopId: user.shopId, name: name },
    });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: name, shopId: user.shopId },
      });
    }
    brandCache.set(key, brand.id);
    return brand.id;
  }

  let created = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[idx.name]?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const price = idx.price !== -1 ? parseFloat(cols[idx.price]) || 0 : 0;
    const purchasePrice =
      idx.purchasePrice !== -1 ? parseFloat(cols[idx.purchasePrice]) || 0 : 0;
    const quantity = idx.quantity !== -1 ? parseInt(cols[idx.quantity]) || 0 : 0;
    const barcode = idx.barcode !== -1 ? cols[idx.barcode]?.trim() || null : null;

    const categoryId =
      idx.category !== -1 ? await getCategoryId(cols[idx.category] || "") : null;
    const brandId =
      idx.brand !== -1 ? await getBrandId(cols[idx.brand] || "") : null;

    await prisma.product.create({
      data: {
        name,
        price,
        purchasePrice,
        quantity,
        barcode,
        categoryId,
        brandId,
        shopId: user.shopId,
      },
    });
    created++;
  }

  await logAction(user, "Import produits", created + " produits importés");
  revalidatePath("/dashboard/products");

  return {
    ok: true,
    message: `${created} produit(s) importé(s).${skipped > 0 ? ` ${skipped} ligne(s) ignorée(s).` : ""}`,
  };
}