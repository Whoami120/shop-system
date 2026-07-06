"use client";

import { Printer } from "lucide-react";

export default function InvoiceActions() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
    >
      <Printer size={16} /> Imprimer la facture
    </button>
  );
}