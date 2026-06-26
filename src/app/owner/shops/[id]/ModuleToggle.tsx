"use client";

import { useState } from "react";
import { toggleModule } from "./actions";

export default function ModuleToggle({
  shopId,
  moduleId,
  label,
  description,
  initialEnabled,
}: {
  shopId: string;
  moduleId: string;
  label: string;
  description: string | null;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    const newValue = !enabled;
    setEnabled(newValue); // update screen right away
    setSaving(true);
    await toggleModule(shopId, moduleId, newValue);
    setSaving(false);
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      <button
        onClick={handleToggle}
        disabled={saving}
        className={`px-4 py-2 rounded-md text-white text-sm transition-colors ${
          enabled
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 hover:bg-gray-500"
        }`}
      >
        {enabled ? "Activé" : "Désactivé"}
      </button>
    </div>
  );
}