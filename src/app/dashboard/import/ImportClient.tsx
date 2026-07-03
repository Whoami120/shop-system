"use client";

import { useActionState } from "react";
import { importProducts } from "./actions";
import { Upload } from "lucide-react";

export default function ImportClient() {
  const [state, formAction, pending] = useActionState(importProducts, null);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-lg">
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-700">Fichier CSV</label>
          <input
            type="file"
            name="file"
            accept=".csv"
            required
            className="w-full mt-1 text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand file:text-white file:text-sm hover:file:bg-brand-dark file:cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          <Upload size={16} />
          {pending ? "Importation..." : "Importer"}
        </button>
      </form>

      {state && (
        <p className={`mt-4 text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}