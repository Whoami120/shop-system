import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/products", label: "Produits" },
  { href: "/dashboard/reception", label: "Réception" },
  { href: "/dashboard/sale", label: "Vente" },
  { href: "/dashboard/broken", label: "Cassé / perdu" },
  { href: "/dashboard/history", label: "Historique" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar menu */}
      <aside
        style={{
          width: "220px",
          background: "#111",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "24px" }}>
          Shop System
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "white",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "15px",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "20px" }}>
          <UserButton />
        </div>
      </aside>

      {/* Page content */}
      <main style={{ flex: 1, background: "#f7f7f7" }}>{children}</main>
    </div>
  );
}