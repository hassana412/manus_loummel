import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ChevronDown,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  // Hide chrome on admin/seller dashboards to give them more room
  const isDashboard = location.startsWith("/vendeur") || location.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className={`flex-1 ${isDashboard ? "" : ""}`}>{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const categoriesQuery = trpc.catalog.categories.useQuery();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/recherche");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[oklch(0.35_0.06_50)] via-[oklch(0.40_0.08_50)] to-[oklch(0.32_0.06_50)] text-white shadow-warm">
      {/* Top utility bar */}
      <div className="border-b border-white/10 bg-black/10">
        <div className="container flex items-center justify-between py-1.5 text-xs">
          <span className="hidden sm:inline opacity-90">
            Bienvenue sur Loummel — Le marché digital du Nord Cameroun
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/devenir-partenaire" className="hover:text-[oklch(0.85_0.15_80)] transition-colors">
              Vendre sur Loummel
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center gap-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.18_60)] to-[oklch(0.65_0.20_45)] flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xl font-bold leading-none" style={{ fontFamily: "Playfair Display, serif" }}>
              Loum<span className="text-[oklch(0.85_0.18_80)]">mel</span>
            </div>
            <div className="text-[10px] opacity-80 tracking-wide">MARKETPLACE</div>
          </div>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 max-w-2xl hidden md:flex relative">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher produits, boutiques, artisans..."
            className="bg-white text-gray-900 border-0 rounded-full pl-5 pr-12 h-11 shadow-md focus-visible:ring-2 focus-visible:ring-[oklch(0.78_0.18_60)]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_60)] to-[oklch(0.65_0.20_45)] hover:brightness-110 flex items-center justify-center transition-all"
            aria-label="Rechercher"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </form>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white rounded-full px-3"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1 max-w-[100px] truncate">{user?.name ?? "Mon compte"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/mes-commandes")}>
                  <Package className="w-4 h-4 mr-2" />
                  Mes commandes
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/vendeur")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Espace vendeur
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onSelect={() => navigate("/admin")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Administration
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white rounded-full"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Connexion</span>
            </Button>
          )}

          <Link
            href="/devenir-partenaire"
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-[oklch(0.78_0.18_60)] to-[oklch(0.65_0.20_45)] hover:brightness-110 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-md"
          >
            <Crown className="w-4 h-4" />
            Devenir Partenaire
          </Link>

          <Link
            href="/panier"
            className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Ouvrir le panier"
          >
            <Package className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[oklch(0.65_0.25_25)] text-white text-[10px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 hover:text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="mt-8 space-y-2">
                <form onSubmit={submitSearch}>
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                <Link
                  href="/recherche"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-accent"
                >
                  Toutes les catégories
                </Link>
                {categoriesQuery.data?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/recherche?categoryId=${cat.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md hover:bg-accent"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/devenir-partenaire"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium"
                >
                  Créer ma Boutique
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Categories bar */}
      <nav className="hidden md:block border-t border-white/10 bg-black/15">
        <div className="container flex items-center gap-1 overflow-x-auto py-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0">
                <Menu className="w-4 h-4" />
                Toutes les catégories
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {categoriesQuery.data?.map((cat) => (
                <DropdownMenuItem key={cat.id} onSelect={() => navigate(`/recherche?categoryId=${cat.id}`)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-5 w-px bg-white/20 mx-1 shrink-0" />
          {categoriesQuery.data?.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/recherche?categoryId=${cat.id}`}
              className="text-sm px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.04_50)] text-white/90 mt-16">
      <div className="container py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.18_60)] to-[oklch(0.65_0.20_45)] flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              Loummel
            </span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            La marketplace #1 du Nord Cameroun. Découvrez l'artisanat authentique, produits et services de nos talents locaux.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Acheter</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/recherche" className="hover:text-white">Tous les produits</Link></li>
            <li><Link href="/boutiques" className="hover:text-white">Toutes les boutiques</Link></li>
            <li><Link href="/categories" className="hover:text-white">Catégories</Link></li>
            <li><Link href="/recherche?promo=true" className="hover:text-white">Ventes flash</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">Vendre</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/devenir-partenaire" className="hover:text-white">Devenir partenaire</Link></li>
            <li><Link href="/creer-ma-boutique" className="hover:text-white">Créer ma boutique</Link></li>
            <li><Link href="/vendeur/vip" className="hover:text-white">Pack VIP</Link></li>
            <li><Link href="/vendeur" className="hover:text-white">Espace vendeur</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-white">À propos</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Mentions légales</li>
            <li>Conditions générales</li>
            <li>Politique de confidentialité</li>
            <li>Contact : contact@loummel.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4 text-center text-xs opacity-70">
          © {new Date().getFullYear()} Loummel. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
