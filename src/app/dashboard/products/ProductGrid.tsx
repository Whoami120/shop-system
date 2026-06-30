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
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 mb-5 bg-white max-w-md">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="flex-1 outline-none text-sm bg-transparent"
        />
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((p) => {
            const low = p.quantity <= 5;
            return (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Photo */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={28} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold text-brand">
                      {p.price.toFixed(2)} MAD
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                      }`}
                    >
                      Stock {p.quantity}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={13} /> Modifier
                    </Link>
                    <form action={deleteProduct} className="flex-1">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} /> Suppr.
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