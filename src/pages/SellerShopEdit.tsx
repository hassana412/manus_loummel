import { SellerLayout } from "@/components/SellerSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ImageUploader";
import { useRequireShop } from "@/hooks/useRequireShop";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SellerShopEdit() {
  const mine = useRequireShop();
  const cats = trpc.catalog.categories.useQuery();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    region: "",
    phone: "",
    email: "",
    logoUrl: "",
    coverUrl: "",
    categoryId: "",
  });

  useEffect(() => {
    const s = mine.data?.shop;
    if (s) {
      setForm({
        name: s.name ?? "",
        description: s.description ?? "",
        city: s.city ?? "",
        region: s.region ?? "",
        phone: s.phone ?? "",
        email: s.email ?? "",
        logoUrl: s.logoUrl ?? "",
        coverUrl: s.coverUrl ?? "",
        categoryId: s.categoryId ? String(s.categoryId) : "",
      });
    }
  }, [mine.data?.shop]);

  const update = trpc.shop.update.useMutation({
    onSuccess: () => {
      utils.shop.mine.invalidate();
      toast.success("Boutique mise à jour");
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      name: form.name,
      description: form.description || undefined,
      city: form.city || undefined,
      region: form.region || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      logoUrl: form.logoUrl || undefined,
      coverUrl: form.coverUrl || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    });
  };

  return (
    <SellerLayout title="Ma boutique">
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Nom *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Ville</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>Région</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Email contact</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Logo de la boutique</Label>
              <div className="mt-2">
                <ImageUploader
                  kind="shop-logo"
                  label="Logo"
                  value={form.logoUrl}
                  onChange={(v) => setForm({ ...form, logoUrl: v })}
                />
              </div>
            </div>
            <div>
              <Label>Bandeau de couverture</Label>
              <div className="mt-2">
                <ImageUploader
                  kind="shop-cover"
                  label="Couverture"
                  aspect="wide"
                  value={form.coverUrl}
                  onChange={(v) => setForm({ ...form, coverUrl: v })}
                />
              </div>
            </div>
          </div>
          <div>
            <Label>Catégorie principale</Label>
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
          <Button
            type="submit"
            disabled={update.isPending}
            className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white"
          >
            {update.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </Card>
    </SellerLayout>
  );
}
