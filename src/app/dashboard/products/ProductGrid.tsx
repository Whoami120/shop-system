"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  tva: number;
  categoryId: string | null;
  categoryName: string | null;
  brandName: string | null;
  barcode: string | null;
};

export default function ProductGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = products.filter((p) => {
    const text = (p.name + " " + (p.barcode || "")).toLowerCase();
    const matchName = text.includes(search.toLowerCase());
    const matchCategory = categoryFilter === "" || p.categoryId === categoryFilter;
    return matchName && matchCategory;
  });

  return (
    <div>
      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-brand"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-800 font-medium">Aucun produit</p>
          <p className="text-gray-500 text-sm mt-1">
            Commencez par ajouter votre premier produit.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-block mt-4 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
          >
            + Nouveau produit
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {filtered.map((p) => {
            const low = p.quantity <= 5;
            return (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm flex flex-col"
              >
                {/* Photo */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={18} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="p-1.5 flex flex-col gap-0.5">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand">{p.price.toFixed(2)}</span>
                    <span
                      className={`text-[10px] px-1 py-0.5 rounded-full ${
                        low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                      }`}
                    >
                      {p.quantity}
                    </span>
                  </div>

                  <div className="flex gap-1 mt-0.5">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="flex-1 flex items-center justify-center py-0.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={11} />
                    </Link>
                    <form action={deleteProduct} className="flex-1">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center py-0.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}