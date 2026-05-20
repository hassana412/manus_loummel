import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Crown, Flame, Minus, Plus, ShoppingCart, Star, Store, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

export default function ProductPage() {
  const [, params] = useRoute<{ id: string }>("/produit/:id");
  const id = Number(params?.id ?? 0);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { refresh } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const q = trpc.catalog.productById.useQuery({ id }, { enabled: id > 0 });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Ajouté au panier");
    },
    onError: (e) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <div className="container py-8 grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }
  if (!q.data) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Produit introuvable.</p>
        <Link href="/recherche" className="text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
          ← Retour à la marketplace
        </Link>
      </div>
    );
  }

  const { product, shop } = q.data;
  const images = (product.images as string[]) || [];
  const main = images[activeImg] || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800";
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(100 - (product.price / product.comparePrice) * 100)
      : null;

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter pour ajouter au panier");
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: qty });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate(
      { productId: product.id, quantity: qty },
      { onSuccess: () => navigate("/panier") }
    );
  };

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 mb-10">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[oklch(0.96_0.02_80)] shadow-soft">
            <img src={main} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    activeImg === i ? "border-[oklch(0.65_0.20_45)]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {shop?.plan === "vip" && (
              <Badge className="badge-vip border-0">
                <Crown className="w-3 h-3 mr-1" /> Boutique VIP
              </Badge>
            )}
            {product.isFlashDeal && (
              <Badge className="bg-[oklch(0.65_0.25_25)] text-white border-0">
                <Flame className="w-3 h-3 mr-1" /> Vente Flash
              </Badge>
            )}
            {product.kind === "service" && (
              <Badge variant="outline" className="bg-background">Service</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
            {product.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {shop?.rating ? Number(shop.rating).toFixed(1) : "5.0"}
            </span>
            <span>{product.sold} vendus</span>
            <span>Stock : {product.stock}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-[oklch(0.55_0.20_40)]">
              {formatFCFA(product.price)}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatFCFA(product.comparePrice)}
                </span>
                {discount && (
                  <Badge className="bg-[oklch(0.65_0.25_25)] text-white border-0">
                    -{discount}%
                  </Badge>
                )}
              </>
            )}
          </div>

          {product.description && (
            <Card className="p-4 mb-6 bg-[oklch(0.97_0.02_80)] border-0">
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </Card>
          )}

          {shop && (
            <Link href={`/boutique/${shop.slug}`}>
              <Card className="p-4 mb-6 flex items-center gap-3 hover:shadow-soft transition-shadow cursor-pointer">
                <img
                  src={shop.logoUrl || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=200"}
                  alt={shop.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {shop.name}
                    {shop.plan === "vip" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {shop.city ?? "Cameroun"} · {shop.reviewsCount} avis
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-background">
                  <Store className="w-4 h-4" />
                  Visiter
                </Button>
              </Card>
            </Link>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Quantité :</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-10 w-10 hover:bg-accent flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="h-10 w-10 hover:bg-accent flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              onClick={handleAdd}
              disabled={addToCart.isPending}
              className="bg-background border-[oklch(0.65_0.20_45)] text-[oklch(0.55_0.20_40)] hover:bg-[oklch(0.65_0.20_45)] hover:text-white flex-1"
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              onClick={handleBuyNow}
              disabled={addToCart.isPending}
              className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] hover:brightness-110 text-white flex-1"
            >
              Acheter maintenant
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Truck className="w-4 h-4" />
            Livraison disponible partout au Cameroun
          </div>
        </div>
      </div>
    </div>
  );
}
