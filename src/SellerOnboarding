import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, Crown, Sparkles, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function SellerOnboarding() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const mineQuery = trpc.shop.mine.useQuery(undefined, { enabled: isAuthenticated });
  const categoriesQuery = trpc.catalog.categories.useQuery();
  const createShop = trpc.shop.create.useMutation({
    onSuccess: () => {
      toast.success("Boutique créée avec succès !");
      navigate("/vendeur");
    },
    onError: (e) => toast.error(e.message),
  });

  const [step, setStep] = useState<"plan" | "form">("plan");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "vip">("basic");
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    region: "",
    categoryId: "",
    phone: "",
    email: "",
  });

  if (loading) return <div className="container py-16 text-center">Chargement…</div>;
  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Store className="w-16 h-16 mx-auto mb-4 text-[oklch(0.65_0.20_45)]" />
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
          Devenez vendeur sur Loummel
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connectez-vous pour créer votre boutique en quelques minutes.
        </p>
        <Button
          size="lg"
          className="bg-[oklch(0.65_0.20_45)] hover:brightness-110 text-white"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  if (mineQuery.data?.shop) {
    return (
      <div className="container py-16 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-[oklch(0.65_0.20_45)]" />
        <h1 className="text-2xl font-bold mb-2">Vous avez déjà une boutique</h1>
        <p className="text-muted-foreground mb-6">
          {mineQuery.data.shop.name} — accédez à votre espace vendeur.
        </p>
        <Button onClick={() => navigate("/vendeur")} className="bg-[oklch(0.65_0.20_45)] hover:brightness-110 text-white">
          Aller à mon dashboard
        </Button>
      </div>
    );
  }

  if (step === "plan") {
    return (
      <div className="container py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="mb-3 bg-[oklch(0.95_0.04_80)] text-[oklch(0.55_0.20_40)] border-0">
            Étape 1/2 — Choisissez votre formule
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
            Lancez votre boutique sur Loummel
          </h1>
          <p className="text-muted-foreground">
            Démarrez gratuitement, passez au VIP quand vous voulez pour booster votre visibilité.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <PlanCard
            title="Basic"
            price="Gratuit"
            subtitle="Pour démarrer en douceur"
            features={[
              "Boutique en ligne illimitée",
              "Ajout de produits & services",
              "Gestion des commandes",
              "Portefeuille (wallet) intégré",
              "8% de commission par vente",
            ]}
            selected={selectedPlan === "basic"}
            onSelect={() => setSelectedPlan("basic")}
            cta="Continuer en Basic"
          />
          <PlanCard
            title="VIP"
            price="15 000 FCFA / an"
            subtitle="Plus de visibilité, plus de ventes"
            highlight
            features={[
              "Tout le pack Basic",
              "Badge VIP doré sur vos produits",
              "Mise en avant dans la Vitrine VIP",
              "Apparition prioritaire en recherche",
              "Support prioritaire",
              "Accès aux ventes flash exclusives",
            ]}
            selected={selectedPlan === "vip"}
            onSelect={() => setSelectedPlan("vip")}
            cta="Continuer en VIP"
          />
        </div>

        <div className="text-center mt-8">
          <Button
            size="lg"
            onClick={() => setStep("form")}
            className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] hover:brightness-110 text-white"
          >
            Continuer avec {selectedPlan === "vip" ? "VIP" : "Basic"}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Vous pourrez activer le VIP à tout moment depuis votre tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Veuillez indiquer un nom de boutique");
    createShop.mutate({
      name: form.name,
      description: form.description || undefined,
      city: form.city || undefined,
      region: form.region || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      plan: "basic",
    });
  };

  return (
    <div className="container py-12 max-w-2xl">
      <Badge className="mb-3 bg-[oklch(0.95_0.04_80)] text-[oklch(0.55_0.20_40)] border-0">
        Étape 2/2 — Informations de la boutique
      </Badge>
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Créez votre boutique
      </h1>
      <p className="text-muted-foreground mb-6">
        Formule choisie : <strong>{selectedPlan === "vip" ? "VIP" : "Basic"}</strong>
        {selectedPlan === "vip" && " — vous pourrez activer le VIP après la création (15 000 FCFA/an)."}
      </p>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la boutique *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Artisanat Mandara"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Présentez votre activité, vos spécialités, votre savoir-faire…"
              rows={3}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Maroua" />
            </div>
            <div>
              <Label htmlFor="region">Région</Label>
              <Input id="region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Extrême-Nord" />
            </div>
          </div>
          <div>
            <Label>Catégorie principale</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categoriesQuery.data?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+237 6xx xxx xxx" />
            </div>
            <div>
              <Label htmlFor="email">Email contact</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@maboutique.com" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep("plan")} className="bg-background">
              ← Retour
            </Button>
            <Button
              type="submit"
              disabled={createShop.isPending}
              className="flex-1 bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] hover:brightness-110 text-white"
            >
              {createShop.isPending ? "Création..." : "Créer ma boutique"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PlanCard({
  title,
  price,
  subtitle,
  features,
  selected,
  highlight,
  onSelect,
  cta,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  selected: boolean;
  highlight?: boolean;
  onSelect: () => void;
  cta: string;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`relative p-6 cursor-pointer transition-all ${
        selected ? "ring-2 ring-[oklch(0.65_0.20_45)] shadow-warm" : "hover:shadow-soft"
      } ${highlight ? "bg-gradient-to-br from-[oklch(0.97_0.03_80)] to-[oklch(0.95_0.05_80)]" : ""}`}
    >
      {highlight && (
        <Badge className="absolute -top-3 left-6 badge-vip border-0">
          <Crown className="w-3 h-3 mr-1" />
          Le plus populaire
        </Badge>
      )}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
          {title}
        </h3>
        {highlight && <Crown className="w-5 h-5 text-amber-500" />}
      </div>
      <div className="text-3xl font-bold text-[oklch(0.55_0.20_40)] mb-1">{price}</div>
      <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>
      <ul className="space-y-2 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 mt-0.5 text-[oklch(0.55_0.20_40)] shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant={selected ? "default" : "outline"}
        className={`w-full ${
          selected
            ? "bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white"
            : "bg-background"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {cta}
      </Button>
    </Card>
  );
}
