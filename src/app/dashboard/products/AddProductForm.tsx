import { addProduct } from "./actions";
import Button from "@/components/Button";

export default function AddProductForm() {
  return (
    <form
      action={addProduct}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 flex-wrap items-end mb-6"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">Nom</label>
        <input
          type="text"
          name="name"
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">Prix (MAD)</label>
        <input
          type="number"
          name="price"
          step="0.01"
          required
          className="px-3 py-2 border border-gray-300 rounded-md w-32 focus:outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-700">Quantité</label>
        <input
          type="number"
          name="quantity"
          required
          className="px-3 py-2 border border-gray-300 rounded-md w-32 focus:outline-none focus:border-brand"
        />
      </div>

      <Button type="submit">Ajouter</Button>
    </form>
  );
}