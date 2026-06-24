"use client";

import { useState } from "react";
import { createReception } from "./actions";

type Product = { id: string; name: string; quantity: number };
type Supplier = { id: string; name: string };

type Line = {
  productId: string;
  quantity: number;
  purchasePrice: number;
};

export default function ReceptionForm({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { productId: "", quantity: 1, purchasePrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  function addLine() {
    setLines([...lines, { productId: "", quantity: 1, purchasePrice: 0 }]);
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof Line, value: string) {
    const newLines = [...lines];
    if (field === "productId") {
      newLines[index].productId = value;
    } else {
      newLines[index][field] = parseFloat(value) || 0;
    }
    setLines(newLines);
  }

  const total = lines.reduce(
    (sum, l) => sum + l.quantity * l.purchasePrice,
    0
  );

  async function handleSave() {
    setSaving(true);
    await createReception(supplierId || null, lines);
  }

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand";

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <label className="text-sm text-gray-700 mr-2">Fournisseur :</label>
        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className={inputClass}
        >
          <option value="">-- Aucun --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm text-gray-600">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Prix d&apos;achat</th>
              <th className="px-4 py-3">Sous-total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="border-t border-gray-100">
                <td className="px-4 py-2">
                  <select
                    value={line.productId}
                    onChange={(e) => updateLine(index, "productId", e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option value="">-- Choisir --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", e.target.value)}
                    className={`${inputClass} w-24`}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.purchasePrice}
                    onChange={(e) =>
                      updateLine(index, "purchasePrice", e.target.value)
                    }
                    className={`${inputClass} w-28`}
                  />
                </td>
                <td className="px-4 py-2 text-sm">
                  {(line.quantity * line.purchasePrice).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  {lines.length > 1 && (
                    <button
                      onClick={() => removeLine(index)}
                      className="px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      X
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addLine}
        className="px-4 py-2 rounded-md text-white bg-brand hover:bg-brand-dark transition-colors mb-5"
      >
        + Ajouter une ligne
      </button>

      <p className="text-lg font-bold mb-4">Total : {total.toFixed(2)} MAD</p>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-default text-base"
      >
        {saving ? "Enregistrement..." : "Enregistrer la réception"}
      </button>
    </div>
  );
}