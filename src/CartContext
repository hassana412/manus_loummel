import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { createContext, useContext, useMemo, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  isLoading: boolean;
  refresh: () => Promise<unknown>;
};

const CartContext = createContext<CartContextValue>({
  count: 0,
  isLoading: false,
  refresh: async () => undefined,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const value = useMemo<CartContextValue>(
    () => ({
      count: cartQuery.data?.reduce((s, it) => s + it.quantity, 0) ?? 0,
      isLoading: cartQuery.isLoading,
      refresh: () => utils.cart.list.invalidate(),
    }),
    [cartQuery.data, cartQuery.isLoading, utils]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
