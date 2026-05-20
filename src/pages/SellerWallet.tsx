import { SellerLayout } from "@/components/SellerSidebar";
import { Card } from "@/components/ui/card";
import { useRequireShop } from "@/hooks/useRequireShop";
import { formatFCFA } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

export default function SellerWallet() {
  useRequireShop();
  const q = trpc.wallet.mine.useQuery();

  return (
    <SellerLayout title="Mon portefeuille">
      <Card className="p-6 mb-6 bg-gradient-to-br from-[oklch(0.45_0.10_50)] via-[oklch(0.55_0.15_50)] to-[oklch(0.65_0.20_45)] text-white border-0 shadow-warm">
        <div className="flex items-center gap-2 mb-2 opacity-85">
          <Wallet className="w-4 h-4" />
          <span className="text-xs uppercase font-semibold tracking-wide">Solde disponible</span>
        </div>
        <div className="text-4xl font-bold">{formatFCFA(q.data?.wallet.balance ?? 0)}</div>
        <p className="text-sm text-white/80 mt-2">
          Total perçu à ce jour : {formatFCFA(q.data?.wallet.totalEarned ?? 0)}
        </p>
      </Card>

      <h3 className="font-bold mb-3">Historique des transactions</h3>
      {!q.data || q.data.transactions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aucune transaction. Les ventes seront automatiquement créditées ici.
        </Card>
      ) : (
        <Card className="divide-y">
          {q.data.transactions.map((tx) => {
            const positive = tx.amount > 0;
            return (
              <div key={tx.id} className="p-4 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {positive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{tx.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString("fr-FR")} • {tx.type}
                  </div>
                </div>
                <div className={`font-bold ${positive ? "text-[oklch(0.55_0.20_40)]" : "text-red-600"}`}>
                  {positive ? "+" : ""}
                  {formatFCFA(tx.amount)}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </SellerLayout>
  );
}
