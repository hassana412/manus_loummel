import { Crown, LayoutDashboard, Package, ShoppingBag, Store, Wallet } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";

const items = [
  { href: "/vendeur", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vendeur/produits", label: "Produits & services", icon: Package },
  { href: "/vendeur/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/vendeur/wallet", label: "Mon portefeuille", icon: Wallet },
  { href: "/vendeur/boutique", label: "Ma boutique", icon: Store },
  { href: "/vendeur/vip", label: "Passer VIP", icon: Crown },
];

export function SellerLayout({ children, title }: { children: ReactNode; title: string }) {
  const [location] = useLocation();
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        {title}
      </h1>
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside>
          <nav className="sticky top-32 space-y-1 bg-card p-2 rounded-xl shadow-soft">
            {items.map((it) => {
              const Icon = it.icon;
              const active = location === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white"
                      : "hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
