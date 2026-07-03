"use client";

import { useState } from "react";
import { addProduct } from "../actions";
import Button from "@/components/Button";
import Link from "next/link";

export default function ProductForm({
  categories,
  brands,
}: {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [tva, setTva] = useState(0);
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand w-full";

  return (
    <form action={addProduct} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
      {/* Photo */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Photo (optionnel)</p>
        <div className="w-40 h-40 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="aperçu" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs text-center px-2">Aperçu de la photo</span>
          )}
        </div>
        <input
          type="text"
          name="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Lien de l'image (URL)"
          className="mt-2 px-2 py-1.5 border border-gray-300 rounded-md text-xs w-40 focus:outline-none focus:border-brand"
        />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="text-sm text-gray-700">
            Nom du produit <span className="text-red-600">*</span>
          </label>
          <input type="text" name="name" required className={inputClass} placeholder="ex : Lait Centrale 1L" />
        </div>

        <div>
          <label className="text-sm text-gray-700">Code-barres (optionnel)</label>
          <input type="text" name="barcode" className={inputClass} placeholder="ex : 6111234567890" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-700">Prix d&apos;achat (MAD)</label>
            <input
              type="number"
              name="purchasePrice"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">
              Prix de vente (MAD) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Margin display */}
        {price && purchasePrice && (
          <div className="text-sm bg-blue-50 text-blue-700 rounded-md px-3 py-2">
            Marge : {(parseFloat(price) - parseFloat(purchasePrice)).toFixed(2)} MAD
            {parseFloat(purchasePrice) > 0 && (
              <span>
                {" "}
                ({(((parseFloat(price) - parseFloat(purchasePrice)) / parseFloat(purchasePrice)) * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-700">
              Quantité <span className="text-red-600">*</span>
            </label>
            <input type="number" name="quantity" required className={inputClass} placeholder="0" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Alerte stock bas</label>
            <input type="number" name="lowStockLevel" defaultValue={5} className={inputClass} placeholder="5" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700">Catégorie (optionnel)</label>
          <select name="categoryId" className={inputClass}>
            <option value="">-- Aucune --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-700">Marque (optionnel)</label>
          <select name="brandId" className={inputClass}>
            <option value="">-- Aucune --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-700">Unité</label>
          <select name="unit" defaultValue="piece" className={inputClass}>
            <option value="piece">Pièce</option>
            <option value="kg">Kg</option>
            <option value="litre">Litre</option>
            <option value="carton">Carton</option>
            <option value="metre">Mètre</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-700 block mb-1.5">TVA (optionnel)</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTva(0)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                tva === 0
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Aucune
            </button>
            <button
              type="button"
              onClick={() => setTva(20)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                tva === 20
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              20%
            </button>
          </div>
          <input type="hidden" name="tva" value={tva} />
        </div>

        <div className="flex gap-3 mt-2">
          <Button type="submit">Enregistrer</Button>
          <Link
            href="/dashboard/products"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </div>
    </form>
  );
}