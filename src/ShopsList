import { ShopCard } from "@/components/ShopCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function ShopsList() {
  const [location] = useLocation();
  const initialTab = useMemo(() => {
    if (typeof window === "undefined") return "all";
    const p = new URLSearchParams(window.location.search);
    return p.get("filter") === "vip" ? "vip" : p.get("filter") === "featured" ? "featured" : "all";
  }, [location]);
  const [tab, setTab] = useState(initialTab);

  const q = trpc.catalog.shops.useQuery({
    vipOnly: tab === "vip" || undefined,
    featured: tab === "featured" || undefined,
    limit: 200,
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Découvrir nos boutiques
      </h1>
      <p className="text-muted-foreground mb-6">
        Talents et artisans de tout le Nord Cameroun réunis sur une seule plateforme
      </p>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="featured">Vedettes</TabsTrigger>
        </TabsList>
      </Tabs>

      {q.isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : !q.data || q.data.length === 0 ? (
        <p className="text-muted-foreground">Aucune boutique pour ce filtre.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {q.data.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
