"use client";

import Link from "next/link";
import { Printer, Plus } from "lucide-react";

export default function ReceiptActions() {
  return (
    <div className="flex gap-3 justify-center mb-2">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
      >
        <Printer size={16} /> Imprimer
      </button>
      <Link
        href="/dashboard/sale"
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
      >
        <Plus size={16} /> Nouvelle vente
      </Link>
    </div>
  );
}