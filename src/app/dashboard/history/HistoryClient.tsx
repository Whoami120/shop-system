"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Move = {
  id: string;
  date: string;
  type: string;
  product: string;
  quantity: number;
  reason: string;
  user: string;
};

function typeLabel(type: string) {
  if (type === "RECEPTION") return "Réception";
  if (type === "SALE") return "Vente";
  if (type === "BROKEN") return "Cassé / perdu";
  return type;
}

function typeBadge(type: string) {
  if (type === "RECEPTION") return "bg-green-50 text-green-700";
  if (type === "SALE") return "bg-blue-50 text-blue-700";
  if (type === "BROKEN") return "bg-orange-50 text-orange-700";
  return "bg-gray-100 text-gray-600";
}

const PAGE_SIZE = 12;

export default function HistoryClient({ moves }: { moves: Move[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = moves.filter((m) =>
    (m.product + " " + m.user + " " + typeLabel(m.type)).toLowerCase().includes(search.toLowerCase())
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
          placeholder="Rechercher (produit, type, utilisateur)..."
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Aucun mouvement.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Quantité</th>
                <th className="px-4 py-3">Raison</th>
                <th className="px-4 py-3">Par</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((m) => (
                <tr key={m.id} className="border-t border-gray-100 text-sm">
                  <td className="px-4 py-3 text-gray-600">{m.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${typeBadge(m.type)}`}>
                      {typeLabel(m.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.product}</td>
                  <td className="px-4 py-3">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">{m.reason || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{m.user}</td>
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