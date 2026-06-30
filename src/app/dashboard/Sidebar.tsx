"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LogOut,
  ChevronDown,
  Menu,
  X,
  Boxes,
} from "lucide-react";

type Item = { href: string; label: string };
type Group = {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: Item[];
};

export default function Sidebar({
  groups,
  userName,
  userRole,
}: {
  groups: Group[];
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initialOpen: Record<string, boolean> = {};
  groups.forEach((g) => {
    if (g.items.some((it) => pathname === it.href)) {
      initialOpen[g.key] = true;
    }
  });
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // The sidebar content (shared by desktop + mobile)
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center">
          <Boxes size={20} />
        </div>
        <span className="text-lg font-bold">Shop System</span>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-slate-400">{userRole}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {groups.map((group) => {
          if (group.items.length === 1) {
            const item = group.items[0];
            const active = pathname === item.href;
            return (
              <Link
                key={group.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-1 transition-colors ${
                  active ? "bg-brand text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {group.icon}
                {group.label}
              </Link>
            );
          }

          const isOpen = open[group.key];
          const hasActive = group.items.some((it) => pathname === it.href);
          return (
            <div key={group.key} className="mb-1">
              <button
                onClick={() => toggle(group.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors ${
                  hasActive ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  {group.icon}
                  {group.label}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-slate-700 pl-3">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          active ? "bg-brand text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pt-3">
        <ThemeToggle />
      </div>

      {/* User box / logout */}
      <div className="p-3 border-t border-slate-800 mt-2">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-slate-400">{userRole}</p>
            </div>
          </div>
          <Link
            href="/logout"
            prefetch={false}
            className="text-slate-400 hover:text-red-400 transition-colors"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar (only on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <Boxes size={16} />
          </div>
          <span className="font-bold">Shop System</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop sidebar (hidden on small screens) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
          <aside className="relative w-64 bg-slate-900 text-white flex flex-col h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}