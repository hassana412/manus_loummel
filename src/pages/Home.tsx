import { ProductCard } from "@/components/ProductCard";
import { ShopCard } from "@/components/ShopCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Crown, Flame, Gift, Search, Sparkles, Store, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Home() {
  const homepage = trpc.catalog.homepage.useQuery();

  return (
    <div className="min-h-screen">
      <Hero />
      <PromoStrip />
      <FlashDeals products={homepage.data?.flashDeals ?? []} loading={homepage.isLoading} />
      <VipShowcase
        vipShops={homepage.data?.vipShops ?? []}
        vipProducts={homepage.data?.vipProducts ?? []}
        loading={homepage.isLoading}
      />
      <CategoriesSection categories={homepage.data?.categories ?? []} loading={homepage.isLoading} />
      <FeaturedShops shops={homepage.data?.featuredShops ?? []} loading={homepage.isLoading} />
      <CallToAction />
    </div>
  );
}

function Hero() {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/recherche?q=${encodeURIComponent(q.trim())}` : "/recherche");
  };

  const popular = ["Bijoux", "Poterie", "Sacs cuir", "Tissus", "Meubles"];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.35_0.06_50)] via-[oklch(0.45_0.08_50)] to-[oklch(0.55_0.12_50)]" />
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1547055087-bf3ce98b6304?w=1920&q=80')",
          mixBlendMode: "overlay",
        }}
      />
      <div className="relative container py-16 md:py-24 text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[oklch(0.85_0.18_80)]" />
              La marketplace #1 du Nord Cameroun
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
              <Store className="w-3.5 h-3.5" />
              +500 boutiques
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Trouvez tout ce qu'il vous faut
            <span className="block text-[oklch(0.85_0.18_80)]">au meilleur prix</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-xl">
            Artisanat authentique, électronique, mode et plus encore. Des milliers de produits livrés directement chez vous.
          </p>

          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-2xl max-w-2xl"
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher produits, boutiques, services..."
              className="border-0 text-gray-900 h-12 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] hover:brightness-110 text-white h-12 px-8 rounded-xl font-semibold"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/75">Populaires :</span>
            {popular.map((p) => (
              <button
                key={p}
                onClick={() => navigate(`/recherche?q=${encodeURIComponent(p)}`)}
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/creer-ma-boutique">
              <Button
                size="lg"
                className="bg-white text-[oklch(0.4_0.08_50)] hover:bg-[oklch(0.95_0.04_80)] font-semibold rounded-full px-6"
              >
                <Store className="w-4 h-4" />
                Ouvrir ma boutique gratuite
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/recherche">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white rounded-full px-6"
              >
                Explorer les produits
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
            <Stat icon={<Store className="w-5 h-5" />} value="500+" label="Boutiques" />
            <Stat icon={<TrendingUp className="w-5 h-5" />} value="10K+" label="Produits" />
            <Stat icon={<Users className="w-5 h-5" />} value="25K+" label="Clients" />
          </div>
        </div>
      </div>

      <svg className="block w-full text-background" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,40 Q360,0 720,40 T1440,40 L1440,60 L0,60 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
      <div className="text-[oklch(0.85_0.18_80)] mb-1.5">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold">{value}</div>
      <div className="text-xs md:text-sm text-white/80">{label}</div>
    </div>
  );
}

function PromoStrip() {
  const cards = [
    {
      title: "Ventes Flash",
      subtitle: "Jusqu'à -50% sur l'artisanat",
      icon: <Flame className="w-6 h-6" />,
      bg: "bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.22_35)]",
      cta: "Voir les offres",
      href: "/recherche?promo=true",
      tag: "FLASH DEAL",
    },
    {
      title: "Nouvelle Boutique",
      subtitle: "Artisanat Mandara — créations uniques",
      icon: <Sparkles className="w-6 h-6" />,
      bg: "bg-gradient-to-br from-[oklch(0.6_0.18_280)] to-[oklch(0.5_0.20_270)]",
      cta: "Découvrir",
      href: "/boutiques",
      tag: "NOUVEAU",
    },
    {
      title: "Livraison gratuite",
      subtitle: "Dès 25 000 FCFA d'achat",
      icon: <Gift className="w-6 h-6" />,
      bg: "bg-gradient-to-br from-[oklch(0.6_0.18_150)] to-[oklch(0.5_0.20_140)]",
      cta: "En profiter",
      href: "/recherche",
      tag: "PROMO",
    },
    {
      title: "Pack VIP",
      subtitle: "15 000 FCFA/an — visibilité boostée",
      icon: <Crown className="w-6 h-6" />,
      bg: "bg-gradient-to-br from-[oklch(0.7_0.18_85)] to-[oklch(0.6_0.20_55)]",
      cta: "Devenir VIP",
      href: "/devenir-partenaire",
      tag: "VIP",
    },
  ];
  return (
    <section className="container py-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href}>
            <Card
              className={`relative overflow-hidden p-5 text-white ${c.bg} border-0 shadow-warm hover:scale-[1.02] transition-transform cursor-pointer h-full`}
            >
              <div className="text-[10px] font-bold tracking-widest opacity-90 mb-1">{c.tag}</div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-bold leading-tight">{c.title}</h3>
                <div className="bg-white/20 rounded-xl p-2 backdrop-blur shrink-0">{c.icon}</div>
              </div>
              <p className="text-sm text-white/85 mb-4">{c.subtitle}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/15 px-3 py-1 rounded-full">
                {c.cta} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FlashDeals({
  products,
  loading,
}: {
  products: { id: number; name: string; images: unknown; price: number; comparePrice: number | null; sold: number; isFlashDeal: boolean }[];
  loading: boolean;
}) {
  const [time, setTime] = useState({ h: 23, m: 45, s: 12 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) {
          s = 59;
          m--;
          if (m < 0) {
            m = 59;
            h = h > 0 ? h - 1 : 23;
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_25)] to-[oklch(0.55_0.22_35)] flex items-center justify-center text-white shadow-warm">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              Ventes Flash
            </h2>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              Se termine dans
              <span className="font-mono font-bold text-[oklch(0.55_0.22_30)]">
                {String(time.h).padStart(2, "0")}:{String(time.m).padStart(2, "0")}:{String(time.s).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
        <Link href="/recherche?promo=true" className="text-sm text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
          : products.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function VipShowcase({
  vipShops,
  vipProducts,
  loading,
}: {
  vipShops: Array<{
    id: number;
    slug: string;
    name: string;
    description: string | null;
    city: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    plan: "basic" | "vip";
    rating: string | number;
    reviewsCount: number;
    featured: boolean;
  }>;
  vipProducts: Array<{ id: number; name: string; images: unknown; price: number; comparePrice: number | null; sold: number; isFlashDeal: boolean }>;
  loading: boolean;
}) {
  return (
    <section className="bg-gradient-to-br from-[oklch(0.97_0.03_80)] via-background to-[oklch(0.95_0.04_80)] py-12">
      <div className="container">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl badge-vip flex items-center justify-center text-white shadow-warm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
                Vitrine VIP
              </h2>
              <p className="text-sm text-muted-foreground">Découvrez nos boutiques et produits premium</p>
            </div>
          </div>
          <Link href="/boutiques?filter=vip" className="text-sm text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
            Voir tout →
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
            : (
              <>
                {vipShops.slice(0, 1).map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
                {vipProducts.slice(0, 3).map((p) => (
                  <ProductCard key={p.id} product={p} vip />
                ))}
              </>
            )}
        </div>

        <div className="mt-8 bg-gradient-to-r from-[oklch(0.78_0.15_85)] to-[oklch(0.65_0.20_45)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-warm">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
              Vous êtes vendeur ?
            </h3>
            <p className="text-white/90">Passez au Pack VIP pour apparaître ici et booster vos ventes !</p>
          </div>
          <Link href="/vendeur/vip">
            <Button size="lg" className="bg-white text-[oklch(0.45_0.10_50)] hover:bg-[oklch(0.95_0.04_80)] font-bold rounded-full px-6">
              <Crown className="w-4 h-4" />
              Devenir VIP — 15 000 FCFA/an
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({
  categories,
  loading,
}: {
  categories: Array<{ id: number; slug: string; name: string; description: string | null; imageUrl: string | null }>;
  loading: boolean;
}) {
  return (
    <section className="container py-12">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-sm text-[oklch(0.55_0.20_40)] font-semibold mb-1">Explorez</p>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
            Nos Catégories
          </h2>
        </div>
        <Link href="/categories" className="text-sm text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)
          : categories.slice(0, 7).map((cat) => (
              <Link key={cat.id} href={`/recherche?categoryId=${cat.id}`}>
                <Card className="group relative overflow-hidden border-0 p-0 hover:shadow-warm transition-all cursor-pointer aspect-[4/3]">
                  <img
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg leading-tight">{cat.name}</h3>
                    <p className="text-xs text-white/80 line-clamp-1">{cat.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
        <Link href="/categories">
          <Card className="aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white border-0 p-4 hover:shadow-warm transition-all cursor-pointer">
            <ArrowRight className="w-7 h-7" />
            <div className="font-bold text-center">Toutes les Catégories</div>
            <div className="text-xs text-white/80">Découvrez plus de produits</div>
          </Card>
        </Link>
      </div>
    </section>
  );
}

function FeaturedShops({
  shops,
  loading,
}: {
  shops: Array<{
    id: number;
    slug: string;
    name: string;
    description: string | null;
    city: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    plan: "basic" | "vip";
    rating: string | number;
    reviewsCount: number;
    featured: boolean;
  }>;
  loading: boolean;
}) {
  return (
    <section className="bg-[oklch(0.96_0.02_80)] py-12">
      <div className="container">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm text-[oklch(0.55_0.20_40)] font-semibold mb-1">Boutiques Vedettes</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
              Nos Meilleurs Artisans
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Découvrez les boutiques les mieux notées du Nord Cameroun
            </p>
          </div>
          <Link href="/boutiques" className="text-sm text-[oklch(0.55_0.20_40)] font-semibold hover:underline">
            Voir toutes les boutiques →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
            : shops.slice(0, 8).map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="container py-16">
      <div className="rounded-3xl bg-gradient-to-br from-[oklch(0.35_0.06_50)] via-[oklch(0.45_0.10_50)] to-[oklch(0.55_0.18_45)] p-8 md:p-14 text-white text-center shadow-warm relative overflow-hidden">
        <Sparkles className="absolute top-6 left-8 w-6 h-6 text-[oklch(0.85_0.18_80)] opacity-60" />
        <Crown className="absolute bottom-6 right-8 w-8 h-8 text-[oklch(0.85_0.18_80)] opacity-60" />
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
          Lancez votre boutique en ligne aujourd'hui
        </h2>
        <p className="text-white/85 max-w-2xl mx-auto mb-6">
          Rejoignez plus de 500 boutiques sur Loummel et touchez des milliers de clients dans tout le Cameroun.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/creer-ma-boutique">
            <Button size="lg" className="bg-white text-[oklch(0.4_0.08_50)] hover:bg-[oklch(0.95_0.04_80)] font-semibold rounded-full px-6">
              <Store className="w-4 h-4" />
              Créer ma Boutique Gratuite
            </Button>
          </Link>
          <Link href="/boutiques">
            <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white rounded-full px-6">
              Explorer les boutiques
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
