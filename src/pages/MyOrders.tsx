import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Download, Package } from "lucide-react";

const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800 border-amber-200" },
  paid: { label: "Payée", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800 border-red-200" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

export default function MyOrders() {
  const { isAuthenticated, loading } = useAuth();
  const q = trpc.order.listMine.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return <div className="container py-16 text-center">Chargement...</div>;
  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Connectez-vous pour voir vos commandes</h1>
        <Button onClick={() => (window.location.href = getLoginUrl())} className="bg-[oklch(0.65_0.20_45)] text-white">
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Mes commandes
      </h1>
      {q.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !q.data || q.data.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Vous n'avez aucune commande pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {q.data.map(({ order, items }) => {
            const st = STATUS[order.status] ?? STATUS.pending;
            return (
              <Card key={order.id} className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-bold">{order.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("fr-FR")} • {items.length} article(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[oklch(0.55_0.20_40)]">
                      {formatFCFA(order.totalAmount)}
                    </div>
                    <Badge variant="outline" className={`mt-1 ${st.color}`}>
                      {st.label}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground line-clamp-1">
                  {items.map((it) => it.productName).join(" • ")}
                </div>
                <div className="mt-3">
                  <a href={`/api/invoice/${order.id}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="bg-background">
                      <Download className="w-3 h-3" />
                      Facture PDF
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
