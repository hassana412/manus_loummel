import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Download, ShoppingBag } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function OrderSuccess() {
  const [, params] = useRoute<{ id: string }>("/commande/succes/:id");
  const id = Number(params?.id ?? 0);
  const q = trpc.order.byId.useQuery({ id }, { enabled: id > 0 });

  if (q.isLoading) {
    return (
      <div className="container py-12 max-w-2xl">
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (!q.data) {
    return (
      <div className="container py-16 text-center">
        <p>Commande introuvable.</p>
      </div>
    );
  }
  const { order, items } = q.data;

  return (
    <div className="container py-12 max-w-2xl">
      <Card className="p-8 text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Merci pour votre commande !
        </h1>
        <p className="text-muted-foreground mb-1">
          Votre commande <strong>{order.orderNumber}</strong> a été enregistrée.
        </p>
        <p className="text-sm text-muted-foreground">
          Les vendeurs concernés ont été notifiés et préparent votre colis.
        </p>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-bold mb-3">Détails de la commande</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>
                {it.productName} × {it.quantity}
              </span>
              <span className="font-medium">{formatFCFA(it.subtotal)}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">Total payé</span>
          <span className="text-xl font-bold text-[oklch(0.55_0.20_40)]">
            {formatFCFA(order.totalAmount)}
          </span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`/api/invoice/${order.id}`} target="_blank" rel="noreferrer">
          <Button variant="outline" className="bg-background w-full">
            <Download className="w-4 h-4" />
            Télécharger la facture (PDF)
          </Button>
        </a>
        <Link href="/mes-commandes">
          <Button className="bg-[oklch(0.65_0.20_45)] text-white w-full">
            <ShoppingBag className="w-4 h-4" />
            Voir mes commandes
          </Button>
        </Link>
      </div>
    </div>
  );
}
