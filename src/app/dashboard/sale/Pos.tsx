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
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
};

export default function Pos({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(p: Product) {
    setMessage("");
    setCart((prev) => {
      const found = prev.find((c) => c.productId === p.id);
      if (found) {
        // already in cart → +1 (but not over stock)
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

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.productId !== productId) return c;
          const newQty = c.qty + delta;
          if (newQty > c.stock) return c; // not over stock
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
      const saleId = await checkout(
        cart.map((c) => ({ productId: c.productId, quantity: c.qty }))
      );
      setCart([]);
      // Go to the receipt page
      window.location.href = `/dashboard/sale/receipt/${saleId}`;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
      {/* Left: products */}
      <div>
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 mb-3 bg-white">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.quantity <= 0}
              className="text-left border border-gray-200 rounded-lg p-2.5 bg-white hover:border-brand transition-colors disabled:opacity-40"
            >
              <div className="h-14 bg-gray-50 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-brand">{p.price.toFixed(2)}</span>
                <span className="text-xs text-gray-400">stock {p.quantity}</span>
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
          {saving ? "..." : "Encaisser"}
        </button>
      </div>
    </div>
  );
}