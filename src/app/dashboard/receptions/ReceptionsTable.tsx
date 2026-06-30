"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";

type Row = {
  id: string;
  number: string;
  date: string;
  supplier: string;
  itemsCount: number;
  total: number;
  products: string;
};

const PAGE_SIZE = 8;

export default function ReceptionsTable({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = rows.filter((r) => {
    const text = (r.supplier + " " + r.number + " " + r.products).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 items-center mb-4 flex-wrap">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-52 bg-white">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher fournisseur, n° ou produit..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Aucun résultat.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Produits</th>
                <th className="px-4 py-3">Total (MAD)</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{r.number}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.supplier}</td>
                  <td className="px-4 py-3">{r.itemsCount}</td>
                  <td className="px-4 py-3 font-medium">{r.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                      Terminée
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/receptions/${r.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Voir"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {start + 1} à {Math.min(start + PAGE_SIZE, filtered.length)} sur{" "}
            {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm transition-colors ${
                  p === safePage
                    ? "bg-brand text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}