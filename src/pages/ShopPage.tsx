import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Crown, MapPin, Star } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function ShopPage() {
  const [, params] = useRoute<{ slug: string }>("/boutique/:slug");
  const slug = params?.slug ?? "";
  const q = trpc.catalog.shopBySlug.useQuery({ slug }, { enabled: !!slug });

  if (q.isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 rounded-xl mb-6" />
        <Skeleton className="h-8 w-1/3 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  if (!q.data) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Cette boutique n'existe pas.</p>
        <Link href="/boutiques" className="text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
          ← Toutes les boutiques
        </Link>
      </div>
    );
  }

  const { shop, products } = q.data;
  const cover = shop.coverUrl || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1600";
  const rating = typeof shop.rating === "string" ? parseFloat(shop.rating) : shop.rating;

  return (
    <div>
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src={cover} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="container -mt-16 relative">
        <Card className="p-6 md:p-8 flex flex-col md:flex-row items-start gap-6 shadow-warm">
          <img
            src={shop.logoUrl || cover}
            alt={shop.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {shop.plan === "vip" && (
                <Badge className="badge-vip border-0">
                  <Crown className="w-3 h-3 mr-1" /> VIP
                </Badge>
              )}
              {shop.featured && shop.plan !== "vip" && (
                <Badge className="bg-[oklch(0.65_0.20_45)] text-white border-0">
                  <Star className="w-3 h-3 mr-1" /> Vedette
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
              {shop.name}
            </h1>
            <p className="text-muted-foreground mb-3 max-w-2xl">{shop.description}</p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
              {shop.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {shop.city}
                  {shop.region ? `, ${shop.region}` : ""}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)} · {shop.reviewsCount} avis
              </span>
              <span>{products.length} produits</span>
            </div>
          </div>
        </Card>

        <div className="my-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            Catalogue de la boutique
          </h2>
          {products.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Cette boutique n'a pas encore ajouté de produits.
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} vip={shop.plan === "vip"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
