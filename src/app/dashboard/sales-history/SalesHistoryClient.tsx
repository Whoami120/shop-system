"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";

type Row = {
  id: string;
  number: string;
  date: string;
  cashier: string;
  itemsCount: number;
  total: number;
};

const PAGE_SIZE = 10;

export default function SalesHistoryClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = rows.filter((r) =>
    (r.number + " " + r.cashier).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white max-w-md mb-4">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher (n° ou caissier)..."
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-800 font-medium">Aucune vente</p>
          <p className="text-gray-500 text-sm mt-1">
            Les ventes apparaîtront ici après le premier encaissement.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Caissier</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Total (MAD)</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 font-medium">{r.number}</td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3">{r.cashier}</td>
                  <td className="px-4 py-3">{r.itemsCount}</td>
                  <td className="px-4 py-3 font-medium">{r.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/sale/receipt/${r.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Voir le ticket"
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

      {filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {start + 1} à {Math.min(start + PAGE_SIZE, filtered.length)} sur {filtered.length}
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
                  p === safePage ? "bg-brand text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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