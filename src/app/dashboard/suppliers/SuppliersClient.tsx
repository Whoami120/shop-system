"use client";

import { useState } from "react";
import { Search, Plus, Phone, X, Pencil, Trash2 } from "lucide-react";
import { addSupplier, updateSupplier, deleteSupplier } from "./actions";

type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Pick a consistent color per supplier based on its name
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];
function colorFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}

const PAGE_SIZE = 8;

export default function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) => {
    const text = (s.name + " " + (s.city || "") + " " + (s.phone || "")).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(s: Supplier) {
    setEditing(s);
    setModalOpen(true);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un fournisseur..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <p className="text-gray-800 font-medium">Aucun fournisseur</p>
          <p className="text-gray-500 text-sm mt-1">
            Ajoutez votre premier fournisseur.
          </p>
          <button
            onClick={openNew}
            className="inline-block mt-4 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
          >
            + Nouveau fournisseur
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${colorFor(
                          s.name
                        )}`}
                      >
                        {initials(s.name)}
                      </div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-gray-400" /> {s.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.city || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <form action={deleteSupplier}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
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
            Affichage de {start + 1} à {Math.min(start + PAGE_SIZE, filtered.length)} sur{" "}
            {filtered.length} fournisseurs
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800">
                {editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form action={editing ? updateSupplier : addSupplier} className="flex flex-col gap-3">
              {editing && <input type="hidden" name="id" value={editing.id} />}

              <div>
                <label className="text-sm text-gray-700">
                  Nom <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editing?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editing?.phone || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Ville</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={editing?.city || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}