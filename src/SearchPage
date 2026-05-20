import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function useQueryParams() {
  const [location] = useLocation();
  return useMemo(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    return new URLSearchParams(search);
  }, [location]);
}

export default function SearchPage() {
  const params = useQueryParams();
  const [, navigate] = useLocation();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("categoryId") ? Number(params.get("categoryId")) : undefined;
  const promo = params.get("promo") === "true";

  const [search, setSearch] = useState(initialQ);
  const [categoryId, setCategoryId] = useState<number | undefined>(initialCat);

  const categoriesQuery = trpc.catalog.categories.useQuery();
  const productsQuery = trpc.catalog.products.useQuery({
    search: search || undefined,
    categoryId,
    flashOnly: promo || undefined,
    limit: 60,
  });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (categoryId) p.set("categoryId", String(categoryId));
    if (promo) p.set("promo", "true");
    navigate(`/recherche${p.toString() ? `?${p}` : ""}`);
  };

  const clearAll = () => {
    setSearch("");
    setCategoryId(undefined);
    navigate("/recherche");
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        {promo ? "Ventes flash" : "Explorer la marketplace"}
      </h1>
      <p className="text-muted-foreground mb-6">
        {productsQuery.data?.length ?? 0} produits trouvés
      </p>

      <form onSubmit={submitSearch} className="flex gap-2 mb-6 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9"
          />
        </div>
        <Button type="submit" className="bg-[oklch(0.65_0.20_45)] hover:brightness-110 text-white">
          Rechercher
        </Button>
      </form>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside>
          <Card className="p-5 sticky top-32">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </h3>
              {(search || categoryId || promo) && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
                  <X className="w-3 h-3" />
                  Effacer
                </Button>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Catégories</h4>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <button
                  onClick={() => setCategoryId(undefined)}
                  className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                    !categoryId ? "bg-[oklch(0.65_0.20_45)] text-white" : "hover:bg-accent"
                  }`}
                >
                  Toutes
                </button>
                {categoriesQuery.data?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                      categoryId === cat.id ? "bg-[oklch(0.65_0.20_45)] text-white" : "hover:bg-accent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        <div>
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : !productsQuery.data || productsQuery.data.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucun produit trouvé pour cette recherche.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {productsQuery.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
