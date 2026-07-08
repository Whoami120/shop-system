"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors print:hidden"
    >
      <Printer size={16} /> Imprimer / PDF
    </button>
  );
}