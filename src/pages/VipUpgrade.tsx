import { SellerLayout } from "@/components/SellerSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRequireShop } from "@/hooks/useRequireShop";
import { trpc } from "@/lib/trpc";
import { Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function VipUpgrade() {
  const mine = useRequireShop();
  const utils = trpc.useUtils();
  const subscribe = trpc.subscription.upgradeToVip.useMutation({
    onSuccess: () => {
      utils.shop.mine.invalidate();
      toast.success("Bienvenue dans le Pack VIP !");
    },
    onError: (e) => toast.error(e.message),
  });

  const isVip = mine.data?.shop.plan === "vip";

  return (
    <SellerLayout title="Pack VIP">
      <Card className="p-6 md:p-8 bg-gradient-to-br from-[oklch(0.95_0.05_80)] to-[oklch(0.92_0.08_80)] border-0 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="badge-vip border-0">
            <Crown className="w-3 h-3 mr-1" />
            Pack VIP — 15 000 FCFA / an
          </Badge>
          {isVip && (
            <Badge className="bg-green-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          )}
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Faites décoller votre boutique
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Le Pack VIP est conçu pour les vendeurs qui veulent maximiser leur visibilité et leurs ventes sur Loummel.
        </p>

        <ul className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            "Badge VIP doré sur tous vos produits",
            "Apparition prioritaire dans la Vitrine VIP",
            "Mise en avant dans les résultats de recherche",
            "Accès aux ventes flash exclusives",
            "Support prioritaire 7j/7",
            "Statistiques avancées",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
              <Check className="w-5 h-5 text-[oklch(0.55_0.20_40)] shrink-0" />
              <span className="text-sm font-medium">{f}</span>
            </li>
          ))}
        </ul>

        {isVip ? (
          <Button disabled className="bg-green-600 text-white">
            VIP actif jusqu'au{" "}
            {mine.data?.shop.vipExpiresAt
              ? new Date(mine.data.shop.vipExpiresAt).toLocaleDateString("fr-FR")
              : "—"}
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={subscribe.isPending}
            onClick={() => subscribe.mutate()}
            className="badge-vip border-0 text-white font-bold px-6 hover:brightness-110"
          >
            <Crown className="w-4 h-4" />
            {subscribe.isPending ? "Activation..." : "Activer le VIP — 15 000 FCFA / an"}
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Paiement sécurisé par Stripe (activable depuis votre tableau de bord).
        </p>
      </Card>
    </SellerLayout>
  );
}
