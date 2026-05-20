import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Crown, Minus, Plus, ShoppingBag, Store, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { refresh } = useCart();
  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const setQuantity = trpc.cart.setQuantity.useMutation({
    onSuccess: () => refresh(),
  });
  const remove = trpc.cart.remove.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Article retiré");
    },
  });

  const groups = useMemo(() => {
    const map = new Map<number, { shop: NonNullable<typeof cartQuery.data>[number]["shop"]; items: NonNullable<typeof cartQuery.data> }>();
    for (const item of cartQuery.data ?? []) {
      if (!item.shop) continue;
      const existing = map.get(item.shop.id);
      if (existing) existing.items.push(item);
      else map.set(item.shop.id, { shop: item.shop, items: [item] });
    }
    return Array.from(map.values());
  }, [cartQuery.data]);

  const total = useMemo(
    () =>
      (cartQuery.data ?? []).reduce(
        (s, it) => s + (it.product?.price ?? 0) * it.quantity,
        0
      ),
    [cartQuery.data]
  );

  if (loading) return <div className="container py-16 text-center">Chargement...</div>;
  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Connectez-vous pour voir votre panier</h1>
        <Button
          className="mt-4 bg-[oklch(0.65_0.20_45)] hover:brightness-110 text-white"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  if (!cartQuery.data || cartQuery.data.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-6">Découvrez nos boutiques et produits.</p>
        <Link href="/recherche">
          <Button className="bg-[oklch(0.65_0.20_45)] hover:brightness-110 text-white">
            Explorer la marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Mon Panier
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          {groups.map((g) => (
            <Card key={g.shop!.id} className="overflow-hidden">
              <div className="p-4 bg-[oklch(0.97_0.02_80)] border-b flex items-center gap-2">
                <Store className="w-4 h-4 text-[oklch(0.55_0.20_40)]" />
                <Link href={`/boutique/${g.shop!.slug}`} className="font-semibold hover:underline">
                  {g.shop!.name}
                </Link>
                {g.shop!.plan === "vip" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <div className="divide-y">
                {g.items.map((item) => {
                  const imgs = (item.product?.images as string[]) ?? [];
                  return (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <img
                        src={imgs[0] || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=200"}
                        alt={item.product?.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/produit/${item.productId}`} className="font-medium hover:underline line-clamp-2">
                          {item.product?.name}
                        </Link>
                        <div className="text-sm text-[oklch(0.55_0.20_40)] font-semibold mt-1">
                          {formatFCFA(item.product?.price ?? 0)}
                        </div>
                      </div>
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            setQuantity.mutate({
                              productId: item.productId,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="h-9 w-9 hover:bg-accent flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            setQuantity.mutate({
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="h-9 w-9 hover:bg-accent flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="font-bold text-[oklch(0.55_0.20_40)]">
                          {formatFCFA((item.product?.price ?? 0) * item.quantity)}
                        </div>
                        <button
                          onClick={() => remove.mutate({ productId: item.productId })}
                          className="text-xs text-muted-foreground hover:text-destructive mt-1 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-6 sticky top-32">
            <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Articles</span>
                <span>{cartQuery.data.reduce((s, it) => s + it.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Boutiques différentes</span>
                <span>{groups.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Livraison</span>
                <span>À calculer</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-[oklch(0.55_0.20_40)]">
                  {formatFCFA(total)}
                </span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/commande")}
              className="w-full mt-5 bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] hover:brightness-110 text-white"
              size="lg"
            >
              Passer la commande
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Paiement sécurisé par Stripe
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
