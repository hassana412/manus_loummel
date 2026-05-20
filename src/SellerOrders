import { SellerLayout } from "@/components/SellerSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRequireShop } from "@/hooks/useRequireShop";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Package } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-800 border-purple-200" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800 border-red-200" },
};

export default function SellerOrders() {
  useRequireShop();
  const utils = trpc.useUtils();
  const list = trpc.order.listForShop.useQuery();
  const updateStatus = trpc.order.updateItemStatus.useMutation({
    onSuccess: () => {
      utils.order.listForShop.invalidate();
      toast.success("Statut mis à jour");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <SellerLayout title="Commandes reçues">
      {!list.data || list.data.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune commande pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.data.map((line) => {
            const status = STATUS_LABELS[line.item.status] ?? STATUS_LABELS.pending;
            return (
              <Card key={line.item.id} className="p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-xs text-muted-foreground">
                      Commande #{line.order?.orderNumber} • {line.order?.createdAt ? new Date(line.order.createdAt).toLocaleDateString("fr-FR") : ""}
                    </div>
                    <div className="font-semibold mt-1">{line.item.productName}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantité : {line.item.quantity} × {formatFCFA(line.item.unitPrice)}
                    </div>
                    {line.order && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Client : {line.order.customerName ?? "—"}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[oklch(0.55_0.20_40)]">
                      {formatFCFA(line.item.subtotal)}
                    </div>
                    <Badge variant="outline" className={`mt-1 ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <Select
                    value={line.item.status}
                    onValueChange={(v) =>
                      updateStatus.mutate({ itemId: line.item.id, status: v as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}
