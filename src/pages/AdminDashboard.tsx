import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import {
  Crown,
  ShieldAlert,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const ORDER_STATUS_OPTIONS = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";

  const stats = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const usersQ = trpc.admin.users.useQuery(undefined, { enabled: isAdmin });
  const shopsQ = trpc.admin.shops.useQuery(undefined, { enabled: isAdmin });
  const ordersQ = trpc.admin.orders.useQuery(undefined, { enabled: isAdmin });

  const setShopStatus = trpc.admin.setShopStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut de la boutique mis à jour");
      utils.admin.shops.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const setShopPlan = trpc.admin.setShopPlan.useMutation({
    onSuccess: () => {
      toast.success("Plan de la boutique mis à jour");
      utils.admin.shops.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const setUserRole = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle utilisateur mis à jour");
      utils.admin.users.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const setOrderStatus = trpc.admin.setOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut de commande mis à jour");
      utils.admin.orders.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="container py-16 text-center">Chargement…</div>;
  if (!isAdmin) {
    return (
      <div className="container py-16 text-center">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-destructive" />
        <h1 className="text-2xl font-bold mb-2">Accès réservé aux administrateurs</h1>
        <p className="text-muted-foreground">
          Connectez-vous avec un compte administrateur pour accéder à ce tableau de bord.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-7 h-7 text-amber-500" />
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Administration
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Utilisateurs"
          value={stats.isLoading ? "…" : String(stats.data?.users ?? 0)}
        />
        <StatCard
          icon={<Store className="w-5 h-5" />}
          label="Boutiques"
          value={stats.isLoading ? "…" : String(stats.data?.shops ?? 0)}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Commandes"
          value={stats.isLoading ? "…" : String(stats.data?.orders ?? 0)}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Chiffre d'affaires"
          value={stats.isLoading ? "…" : formatFCFA(stats.data?.revenue ?? 0)}
          tone="primary"
        />
      </div>

      <Tabs defaultValue="shops">
        <TabsList>
          <TabsTrigger value="shops">Boutiques</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        {/* ------------------ Boutiques ------------------ */}
        <TabsContent value="shops">
          <Card className="overflow-x-auto">
            {shopsQ.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <Th>Nom</Th>
                    <Th>Ville</Th>
                    <Th>Plan</Th>
                    <Th>Statut</Th>
                    <Th>Note</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {shopsQ.data?.map((s) => (
                    <tr key={s.id} className="border-t">
                      <Td className="font-medium">{s.name}</Td>
                      <Td>{s.city ?? "—"}</Td>
                      <Td>
                        <Badge
                          variant="outline"
                          className={
                            s.plan === "vip" ? "badge-vip border-0 text-white" : ""
                          }
                        >
                          {s.plan}
                        </Badge>
                      </Td>
                      <Td>
                        <StatusBadge status={s.status} />
                      </Td>
                      <Td>{Number(s.rating).toFixed(1)} ★</Td>
                      <Td>
                        <div className="flex flex-wrap items-center gap-2">
                          <Select
                            value={s.status}
                            onValueChange={(v) =>
                              setShopStatus.mutate({
                                shopId: s.id,
                                status: v as "pending" | "active" | "suspended",
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-32 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspendue</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={s.plan}
                            onValueChange={(v) =>
                              setShopPlan.mutate({
                                shopId: s.id,
                                plan: v as "basic" | "vip",
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-24 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        {/* ------------------ Utilisateurs ------------------ */}
        <TabsContent value="users">
          <Card className="overflow-x-auto">
            {usersQ.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <Th>Nom</Th>
                    <Th>Email</Th>
                    <Th>Rôle</Th>
                    <Th>Dernière connexion</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {usersQ.data?.map((u) => (
                    <tr key={u.id} className="border-t">
                      <Td>{u.name ?? "—"}</Td>
                      <Td className="text-muted-foreground">{u.email ?? "—"}</Td>
                      <Td>
                        <Badge
                          variant="outline"
                          className={
                            u.role === "admin" ? "bg-amber-100 text-amber-800" : ""
                          }
                        >
                          {u.role}
                        </Badge>
                      </Td>
                      <Td>{new Date(u.lastSignedIn).toLocaleDateString("fr-FR")}</Td>
                      <Td>
                        {u.role === "admin" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-background"
                            disabled={u.id === user?.id}
                            onClick={() =>
                              setUserRole.mutate({ userId: u.id, role: "user" })
                            }
                          >
                            Rétrograder
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-background"
                            onClick={() =>
                              setUserRole.mutate({ userId: u.id, role: "admin" })
                            }
                          >
                            Promouvoir admin
                          </Button>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        {/* ------------------ Commandes ------------------ */}
        <TabsContent value="orders">
          <Card className="overflow-x-auto">
            {ordersQ.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <Th>N°</Th>
                    <Th>Total</Th>
                    <Th>Paiement</Th>
                    <Th>Date</Th>
                    <Th>Statut</Th>
                  </tr>
                </thead>
                <tbody>
                  {ordersQ.data?.map((o) => (
                    <tr key={o.id} className="border-t">
                      <Td className="font-mono">{o.orderNumber}</Td>
                      <Td className="font-bold">{formatFCFA(o.totalAmount)}</Td>
                      <Td>
                        <StatusBadge status={o.paymentStatus} />
                      </Td>
                      <Td className="text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </Td>
                      <Td>
                        <Select
                          value={o.status}
                          onValueChange={(v) =>
                            setOrderStatus.mutate({
                              orderId: o.id,
                              status: v as (typeof ORDER_STATUS_OPTIONS)[number],
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-36 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`p-3 ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" || status === "paid" || status === "delivered"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : status === "pending"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : status === "shipped"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-rose-100 text-rose-800 border-rose-200";
  return (
    <Badge variant="outline" className={tone}>
      {status}
    </Badge>
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
    <Card
      className={`p-5 ${
        tone === "primary"
          ? "bg-gradient-to-br from-[oklch(0.65_0.20_45)] to-[oklch(0.55_0.18_40)] text-white border-0 shadow-warm"
          : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 mb-2 ${
          tone === "primary" ? "text-white/85" : "text-muted-foreground"
        }`}
      >
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
