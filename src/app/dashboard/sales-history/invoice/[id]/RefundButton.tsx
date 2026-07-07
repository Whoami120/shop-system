"use client";

import { useState } from "react";
import { refundSale } from "@/app/dashboard/sale/actions";
import { RotateCcw } from "lucide-react";

export default function RefundButton({
  saleId,
  alreadyRefunded,
}: {
  saleId: string;
  alreadyRefunded: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(alreadyRefunded);
  const [error, setError] = useState("");

  async function handleRefund() {
    if (!confirm("Confirmer le remboursement de cette vente ? Le stock sera remis.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await refundSale(saleId);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <span className="text-sm px-3 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-200">
        Remboursée
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-red-600 text-sm">{error}</span>}
      <button
        onClick={handleRefund}
        disabled={busy}
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        <RotateCcw size={16} /> {busy ? "..." : "Rembourser"}
      </button>
    </div>
  );
}