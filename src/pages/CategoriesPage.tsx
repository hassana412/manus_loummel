import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function CategoriesPage() {
  const q = trpc.catalog.categories.useQuery();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
        Toutes les catégories
      </h1>
      <p className="text-muted-foreground mb-8">Trouvez ce qu'il vous faut par univers</p>
      {q.isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {q.data?.map((cat) => (
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
                  <p className="text-xs text-white/80 line-clamp-2">{cat.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
