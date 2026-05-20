import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, MapPin, Star } from "lucide-react";
import { Link } from "wouter";

type Props = {
  shop: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    city: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    plan: "basic" | "vip";
    rating: string | number;
    reviewsCount: number;
    featured: boolean;
  };
};

export function ShopCard({ shop }: Props) {
  const cover = shop.coverUrl || shop.logoUrl || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800";
  const rating = typeof shop.rating === "string" ? parseFloat(shop.rating) : shop.rating;

  return (
    <Card className="overflow-hidden p-0 group hover:shadow-warm transition-all duration-200 bg-card border-[oklch(0.92_0.015_70)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={cover}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {shop.plan === "vip" && (
            <Badge className="badge-vip border-0">
              <Crown className="w-3 h-3 mr-1" /> Boutique VIP
            </Badge>
          )}
          {shop.featured && shop.plan !== "vip" && (
            <Badge className="bg-[oklch(0.65_0.20_45)] text-white border-0">
              <Star className="w-3 h-3 mr-1" /> Vedette
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-0.5 rounded-full text-xs font-semibold text-[oklch(0.4_0.06_50)] flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-foreground line-clamp-1">{shop.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {shop.description ?? "Boutique partenaire Loummel"}
        </p>
        <div className="flex items-center justify-between pt-1">
          {shop.city && (
            <span className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="w-3 h-3" />
              {shop.city}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{shop.reviewsCount} avis</span>
        </div>
        <Link href={`/boutique/${shop.slug}`} className="block">
          <Button variant="outline" className="w-full mt-2 bg-background hover:bg-[oklch(0.65_0.20_45)] hover:text-white hover:border-transparent transition-all">
            Visiter la boutique
          </Button>
        </Link>
      </div>
    </Card>
  );
}
