"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // On load, read saved choice
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-slate-700 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {dark ? "Mode clair" : "Mode sombre"}
    </button>
  );
}