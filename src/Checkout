import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Lock, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { refresh } = useCart();
  const cartQuery = trpc.cart.list.useQuery();
  const checkout = trpc.order.checkout.useMutation();
  const confirm = trpc.order.confirmPayment.useMutation();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    notes: "",
    saveAddress: true,
  });

  const total = useMemo(
    () => (cartQuery.data ?? []).reduce((s, it) => s + (it.product?.price ?? 0) * it.quantity, 0),
    [cartQuery.data]
  );

  const isPending = checkout.isPending || confirm.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.line1 || !form.city) {
      return toast.error("Veuillez remplir les champs obligatoires");
    }
    try {
      const created = await checkout.mutateAsync({
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          region: form.region || undefined,
          country: "Cameroun",
        },
        billingInfo: {
          name: form.fullName,
          email: form.email || `${form.phone}@loummel.local`,
          phone: form.phone,
        },
        notes: form.notes || undefined,
        saveAddress: form.saveAddress,
      });
      // Simulated payment confirmation (Stripe webhook to be integrated)
      await confirm.mutateAsync({ orderId: created.orderId });
      await refresh();
      toast.success("Paiement effectué — merci !");
      navigate(`/commande/succes/${created.orderId}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (!cartQuery.data || cartQuery.data.length === 0) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Votre panier est vide.</p>
        <Button onClick={() => navigate("/recherche")} className="bg-[oklch(0.65_0.20_45)] text-white">
          Continuer mes achats
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
        Finaliser ma commande
      </h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-bold mb-4">Informations de livraison</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Nom complet *</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <Label>Téléphone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+237..." />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Adresse *</Label>
                <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required placeholder="Quartier, rue, n°..." />
              </div>
              <div className="sm:col-span-2">
                <Label>Complément (optionnel)</Label>
                <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              </div>
              <div>
                <Label>Ville *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div>
                <Label>Région</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes pour la livraison</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.saveAddress}
                  onCheckedChange={(v) => setForm({ ...form, saveAddress: !!v })}
                />
                Enregistrer cette adresse pour mes prochaines commandes
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Paiement sécurisé
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Le paiement réel sera traité par Stripe. Pour l'instant, la commande est confirmée en mode démonstration.
            </p>
            <div className="bg-[oklch(0.97_0.02_80)] p-4 rounded-lg text-sm flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[oklch(0.55_0.20_40)]" />
              <span>Les fonds seront automatiquement répartis dans le portefeuille de chaque boutique.</span>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-32">
            <h3 className="font-bold mb-3">Votre commande</h3>
            <ul className="space-y-1.5 text-sm mb-3 max-h-60 overflow-y-auto">
              {cartQuery.data.map((it) => (
                <li key={it.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground line-clamp-1">
                    {it.product?.name} × {it.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatFCFA((it.product?.price ?? 0) * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-[oklch(0.55_0.20_40)]">{formatFCFA(total)}</span>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="w-full bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white"
            >
              {isPending ? "Traitement..." : "Confirmer & Payer"}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">Paiement sécurisé par Stripe</p>
          </Card>
        </div>
      </form>
    </div>
  );
}
