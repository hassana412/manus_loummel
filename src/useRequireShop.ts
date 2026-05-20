import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function useRequireShop() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const mine = trpc.shop.mine.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!mine.isLoading && !mine.data) {
      navigate("/creer-ma-boutique");
    }
  }, [loading, isAuthenticated, mine.isLoading, mine.data, navigate]);

  return mine;
}
