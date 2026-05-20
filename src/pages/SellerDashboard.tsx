import { SellerLayout } from "@/components/SellerSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireShop } from "@/hooks/useRequireShop";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Crown, Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { Link } from "wouter";

export default function SellerDashboard() {
  const mine = useRequireShop();
  const walletQuery = trpc.wallet.mine.useQuery();

  if (mine.isLoading || !mine.data) {
    return (
      <SellerLayout title="Tableau de bord">
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
        </div>
      </SellerLayout>
    );
  }

  const { shop, stats, wallet } = mine.data;

  return (
    <SellerLayout title="Tableau de bord">
      <Card className="p-5 mb-5 bg-gradient-to-r from-[oklch(0.35_0.06_50)] to-[oklch(0.55_0.18_45)] text-white border-0 shadow-warm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-white/80">Bienvenue dans</p>
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "Playfair Display, serif" }}>
              {shop.name}
              {shop.plan === "vip" && <Crown className="w-5 h-5 text-amber-300" />}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              Plan actuel :{" "}
              <Badge className={shop.plan === "vip" ? "badge-vip border-0" : "bg-white/15 text-white border-0"}>
                {shop.plan.toUpperCase()}
              </Badge>
            </p>
          </div>
          {shop.plan !== "vip" && (
            <Link href="/vendeur/vip">
              <Button className="bg-white text-[oklch(0.4_0.08_50)] hover:bg-[oklch(0.95_0.04_80)] font-semibold">
                <Crown className="w-4 h-4" />
                Passer VIP
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Solde wallet"
          value={formatFCFA(wallet?.balance ?? 0)}
          tone="primary"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Revenu total"
          value={formatFCFA(stats.revenue)}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Commandes"
          value={String(stats.orders)}
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Produits"
          value={String(stats.products)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold mb-3">Actions rapides</h3>
          <div className="space-y-2">
            <Link href="/vendeur/produits">
              <Button variant="outline" className="w-full justify-start bg-background">
                <Package className="w-4 h-4" /> Ajouter un produit
              </Button>
            </Link>
            <Link href="/vendeur/commandes">
              <Button variant="outline" className="w-full justify-start bg-background">
                <ShoppingBag className="w-4 h-4" /> Voir mes commandes
              </Button>
            </Link>
            <Link href={`/boutique/${shop.slug}`}>
              <Button variant="outline" className="w-full justify-start bg-background">
                <Crown className="w-4 h-4" /> Voir ma vitrine publique
              </Button>
            </Link>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold mb-3">Dernières transactions wallet</h3>
          {walletQuery.data?.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune transaction pour le moment.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {walletQuery.data?.transactions.slice(0, 5).map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{tx.description}</span>
                  <span className="font-semibold text-[oklch(0.55_0.20_40)]">
                    +{formatFCFA(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </SellerLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <Card className={`p-5 ${tone === "primary" ? "bg-gradient-to-br from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white border-0 shadow-warm" : ""}`}>
      <div className={`flex items-center gap-2 mb-2 ${tone === "primary" ? "text-white/85" : "text-muted-foreground"}`}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
