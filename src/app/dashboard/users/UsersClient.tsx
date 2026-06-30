"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { createUser } from "./actions";

type User = {
  id: string;
  name: string;
  username: string;
  role: string;
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];
function colorFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return avatarColors[sum % avatarColors.length];
}

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "CASHIER") return "Caissier";
  if (role === "STOCK") return "Stock";
  return role;
}

function roleBadge(role: string) {
  if (role === "ADMIN") return "bg-blue-50 text-blue-700";
  if (role === "CASHIER") return "bg-green-50 text-green-700";
  if (role === "STOCK") return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function UsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = users.filter((u) =>
    (u.name + " " + u.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Nom d&apos;utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${colorFor(u.name)}`}>
                      {initials(u.name)}
                    </div>
                    <span className="font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${roleBadge(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-gray-800">Nouvel utilisateur</p>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form action={createUser} className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-700">Nom <span className="text-red-600">*</span></label>
                <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Nom d&apos;utilisateur <span className="text-red-600">*</span></label>
                <input type="text" name="username" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Mot de passe <span className="text-red-600">*</span></label>
                <input type="text" name="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Rôle</label>
                <select name="role" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand mt-1">
                  <option value="CASHIER">Caissier</option>
                  <option value="STOCK">Stock</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors">
                  Créer
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
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