"use client";

import { deleteShop } from "./actions";

export default function DeleteShopButton({ shopId }: { shopId: string }) {
  return (
    <form
      action={deleteShop}
      onSubmit={(e) => {
        if (!confirm("Supprimer cette boutique et TOUTES ses données ? Action irréversible.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="shopId" value={shopId} />
      <button type="submit" className="text-red-600 hover:underline">
        Supprimer
      </button>
    </form>
  );
}