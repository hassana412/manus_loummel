import { SellerLayout } from "@/components/SellerSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRequireShop } from "@/hooks/useRequireShop";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_FORM = {
  name: "",
  description: "",
  kind: "product" as "product" | "service",
  price: "",
  comparePrice: "",
  stock: "10",
  categoryId: "",
  images: [] as string[],
  isFlashDeal: false,
};

export default function SellerProducts() {
  useRequireShop();
  const utils = trpc.useUtils();
  const list = trpc.product.listMine.useQuery();
  const cats = trpc.catalog.categories.useQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Produit ajouté");
      utils.product.listMine.invalidate();
      setOpen(false);
      setForm(DEFAULT_FORM);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Produit supprimé");
      utils.product.listMine.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nom requis");
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) return toast.error("Prix invalide");
    if (form.images.length === 0) return toast.error("Ajoutez au moins une photo");
    createMutation.mutate({
      name: form.name,
      description: form.description || undefined,
      kind: form.kind,
      price,
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock || 0),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      images: form.images,
      isFlashDeal: form.isFlashDeal,
    });
  };

  return (
    <SellerLayout title="Mes produits & services">
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground">{list.data?.length ?? 0} articles publiés</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white">
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un produit ou service</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label>Nom *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.kind} onValueChange={(v: "product" | "service") => setForm({ ...form, kind: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Produit</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prix (FCFA) *</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Prix barré (optionnel)</Label>
                  <Input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cats.data?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Photos du produit *</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {form.images.map((url, i) => (
                    <ImageUploader
                      key={i}
                      kind="product"
                      value={url}
                      onChange={(v) => {
                        const next = [...form.images];
                        if (v) next[i] = v;
                        else next.splice(i, 1);
                        setForm({ ...form, images: next });
                      }}
                    />
                  ))}
                  {form.images.length < 5 && (
                    <ImageUploader
                      kind="product"
                      value=""
                      onChange={(v) => v && setForm({ ...form, images: [...form.images, v] })}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Jusqu'à 5 photos (8 Mo max chacune). Stockage Sécurisé S3.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.isFlashDeal}
                  onCheckedChange={(v) => setForm({ ...form, isFlashDeal: !!v })}
                />
                <span className="text-sm">Mettre en vente flash</span>
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-background">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white"
                >
                  {createMutation.isPending ? "Enregistrement..." : "Publier"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {list.data?.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground mb-3">Aucun produit publié pour le moment.</p>
          <Button onClick={() => setOpen(true)} className="bg-[oklch(0.65_0.20_45)] text-white">
            Créer mon premier produit
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.data?.map((p) => {
            const img = (p.images as string[])?.[0] ?? "";
            return (
              <Card key={p.id} className="overflow-hidden p-0">
                <div className="aspect-[4/3] bg-[oklch(0.96_0.02_80)]">
                  {img && <img src={img} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm flex-1 line-clamp-1">{p.name}</h3>
                    {p.isFlashDeal && (
                      <Badge className="bg-[oklch(0.65_0.25_25)] text-white border-0 text-[10px]">FLASH</Badge>
                    )}
                  </div>
                  <div className="text-sm text-[oklch(0.55_0.20_40)] font-bold">{formatFCFA(p.price)}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Stock : {p.stock}</span>
                    <span>{p.sold} vendus</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive bg-background"
                    onClick={() => {
                      if (confirm("Supprimer ce produit ?")) deleteMutation.mutate({ id: p.id });
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}
