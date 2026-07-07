"use client";

import { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, Image as ImageIcon } from "lucide-react";
import { checkout } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  barcode: string | null;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
};

export default function Pos({
  products,
  customers,
}: {
  products: Product[];
  customers: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [payMode, setPayMode] = useState<"paid" | "partial" | "credit">("paid");
  const [partialPaid, setPartialPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = products.filter((p) => {
    const text = (p.name + " " + (p.barcode || "")).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  function addToCart(p: Product) {
    setMessage("");
    setCart((prev) => {
      const found = prev.find((c) => c.productId === p.id);
      if (found) {
        if (found.qty >= p.quantity) return prev;
        return prev.map((c) =>
          c.productId === p.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, price: p.price, qty: 1, stock: p.quantity },
      ];
    });
  }

  function handleScan() {
    const query = search.trim();
    if (!query) return;

    // First: exact barcode match (what a scanner sends)
    let match = products.find((p) => p.barcode && p.barcode === query);

    // If no exact barcode, and only one product matches the search text, use it
    if (!match) {
      const matches = products.filter((p) => {
        const text = (p.name + " " + (p.barcode || "")).toLowerCase();
        return text.includes(query.toLowerCase());
      });
      if (matches.length === 1) match = matches[0];
    }

    if (match) {
      if (match.quantity <= 0) {
        setMessage(`${match.name} en rupture de stock`);
      } else {
        addToCart(match);
        setSearch(""); // clear so the next scan is ready
      }
    } else {
      setMessage("Produit introuvable : " + query);
    }
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.productId !== productId) return c;
          const newQty = c.qty + delta;
          if (newQty > c.stock) return c;
          return { ...c, qty: newQty };
        })
        .filter((c) => c.qty > 0)
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      let amountPaid: number | null = null;
      if (customerId) {
        if (payMode === "paid") amountPaid = total;
        else if (payMode === "credit") amountPaid = 0;
        else if (payMode === "partial") amountPaid = parseFloat(partialPaid) || 0;
      }

      const saleId = await checkout(
        cart.map((c) => ({ productId: c.productId, quantity: c.qty })),
        customerId || null,
        amountPaid
      );
      setCart([]);
      window.location.href = `/dashboard/sale/receipt/${saleId}`;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 max-w-full">
      {/* Left: products */}
      <div>
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 mb-3 bg-white">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleScan();
              }
            }}
            autoFocus
            placeholder="Rechercher ou scanner un code-barres..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.quantity <= 0}
              className="text-left border border-gray-200 rounded-lg p-1.5 bg-white hover:border-brand transition-colors disabled:opacity-40"
            >
              <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-1.5 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={18} className="text-gray-300" />
                )}
              </div>
              <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
              <div className="flex justify-between items-center mt-0.5">
                <span className="text-xs text-brand font-medium">{p.price.toFixed(2)}</span>
                <span className="text-[10px] text-gray-400">stk {p.quantity}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: cart */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col min-h-96">
        <p className="flex items-center gap-2 font-medium text-gray-800 mb-3">
          <ShoppingCart size={18} /> Panier
        </p>

        {/* Customer picker */}
        <div className="mb-3">
          <label className="text-xs text-gray-500">Client (optionnel)</label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              if (!e.target.value) setPayMode("paid");
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-1 focus:outline-none focus:border-brand"
          >
            <option value="">Client de passage</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment type */}
        <div className="mb-3">
          <label className="text-xs text-gray-500">Paiement</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setPayMode("paid")}
              className={`flex-1 py-1.5 rounded-md text-xs border transition-colors ${
                payMode === "paid"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Payé
            </button>
            <button
              type="button"
              onClick={() => setPayMode("partial")}
              disabled={!customerId}
              className={`flex-1 py-1.5 rounded-md text-xs border transition-colors disabled:opacity-40 ${
                payMode === "partial"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Partiel
            </button>
            <button
              type="button"
              onClick={() => setPayMode("credit")}
              disabled={!customerId}
              className={`flex-1 py-1.5 rounded-md text-xs border transition-colors disabled:opacity-40 ${
                payMode === "credit"
                  ? "bg-orange-50 text-orange-700 border-orange-300"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Crédit
            </button>
          </div>

          {payMode === "partial" && (
            <div className="mt-2">
              <input
                type="number"
                value={partialPaid}
                onChange={(e) => setPartialPaid(e.target.value)}
                placeholder="Montant payé maintenant"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand"
              />
              {partialPaid !== "" && (
                <p className="text-xs text-orange-600 mt-1">
                  Reste à crédit : {(total - (parseFloat(partialPaid) || 0)).toFixed(2)} MAD
                </p>
              )}
            </div>
          )}

          {!customerId && (
            <p className="text-xs text-gray-400 mt-1">
              Choisissez un client pour vendre à crédit ou en partiel.
            </p>
          )}
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-400 text-sm">Cliquez sur un produit pour l&apos;ajouter.</p>
        ) : (
          <div className="flex flex-col">
            {cart.map((c) => (
              <div
                key={c.productId}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex-1">
                  <p className="text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.price.toFixed(2)} × {c.qty}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(c.productId, -1)}
                    className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm w-5 text-center">{c.qty}</span>
                  <button
                    onClick={() => changeQty(c.productId, 1)}
                    className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus size={13} />
                  </button>
                  <span className="text-sm font-medium w-14 text-right">
                    {(c.price * c.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeLine(c.productId)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {message && (
          <p
            className={`text-sm mb-2 ${
              message.includes("✓") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex justify-between items-center my-3">
          <span className="text-gray-500">Total</span>
          <span className="text-2xl font-bold text-gray-800">
            {total.toFixed(2)} MAD
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={saving || cart.length === 0}
          className="w-full py-3 rounded-md bg-brand text-white font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {saving
            ? "..."
            : payMode === "credit"
            ? "Enregistrer à crédit"
            : payMode === "partial"
            ? "Enregistrer (partiel)"
            : "Encaisser"}
        </button>
      </div>
    </div>
  );
}