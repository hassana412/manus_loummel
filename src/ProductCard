import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatFCFA } from "@/lib/format";
import { Crown, Flame } from "lucide-react";
import { Link } from "wouter";

type Props = {
  product: {
    id: number;
    name: string;
    images: unknown;
    price: number;
    comparePrice: number | null;
    sold: number;
    isFlashDeal: boolean;
    kind?: "product" | "service";
  };
  vip?: boolean;
};

export function ProductCard({ product, vip }: Props) {
  const images = (product.images as string[]) || [];
  const img = images[0] || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600";
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(100 - (product.price / product.comparePrice) * 100)
      : null;

  return (
    <Link href={`/produit/${product.id}`}>
      <Card className="group overflow-hidden h-full p-0 border-[oklch(0.92_0.015_70)] hover:shadow-warm transition-all duration-200 cursor-pointer bg-card">
        <div className="relative aspect-square overflow-hidden bg-[oklch(0.96_0.02_80)]">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
            {discount && (
              <Badge className="bg-[oklch(0.65_0.25_25)] text-white border-0 rounded-md font-bold">
                -{discount}%
              </Badge>
            )}
            {product.isFlashDeal && (
              <Badge className="bg-gradient-to-r from-[oklch(0.65_0.25_25)] to-[oklch(0.7_0.20_45)] text-white border-0 rounded-md">
                <Flame className="w-3 h-3 mr-1" />
                Flash
              </Badge>
            )}
            {vip && (
              <Badge className="badge-vip border-0 rounded-md">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
          {product.kind === "service" && (
            <Badge className="absolute top-2 right-2 bg-[oklch(0.4_0.05_60)] text-white border-0">
              Service
            </Badge>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] text-foreground">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[oklch(0.55_0.20_40)]">
              {formatFCFA(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatFCFA(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{product.sold} vendus</div>
        </div>
      </Card>
    </Link>
  );
}
