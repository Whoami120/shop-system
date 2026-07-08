"use client";

import { Download } from "lucide-react";

type Row = {
  date: string;
  client: string;
  cashier: string;
  total: number;
};

export default function ExportButton({ rows }: { rows: Row[] }) {
  function exportCsv() {
    // Header row
    const header = ["Date", "Client", "Caissier", "Total (MAD)"];
    // Build the CSV text
    const lines = [header.join(",")];
    for (const r of rows) {
      // Wrap each field in quotes to be safe with commas/accents
      const line = [
        `"${r.date}"`,
        `"${r.client}"`,
        `"${r.cashier}"`,
        r.total.toFixed(2),
      ].join(",");
      lines.push(line);
    }
    const csv = lines.join("\n");

    // Add a BOM so Excel reads accents (é, à) correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport-ventes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      className="flex items-center gap-2 px-4 py-2 rounded-md border border-green-300 text-green-700 text-sm hover:bg-green-50 transition-colors print:hidden"
    >
      <Download size={16} /> Exporter Excel
    </button>
  );
}