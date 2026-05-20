import { COOKIE_NAME, PLATFORM_FEE_PCT, VIP_PRICE_FCFA } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  activateVipSubscription,
  clearCart,
  createOrder,
  createProduct,
  createShop,
  creditWallet,
  deleteProduct,
  ensureWallet,
  getCategoryBySlug,
  getGlobalStats,
  getOrderById,
  getOrderItems,
  getProductById,
  getShopById,
  getShopByOwner,
  getShopBySlug,
  getShopStats,
  getUserById,
  listAddresses,
  listAllOrders,
  listAllShops,
  listCartItems,
  listCategories,
  listOrdersByBuyer,
  listOrderItemsByShop,
  listProducts,
  listShops,
  listSubscriptionsByShop,
  listUsers,
  listWalletTransactions,
  removeCartItem,
  updateOrderItemStatus,
  updateOrderStatus,
  updateProduct,
  updateShop,
  upsertCartItem,
  getWalletByShop,
  createAddress,
  requireDb,
} from "./db";
import { users as usersTbl } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  notifyBuyerOrderConfirmed,
  notifyBuyerOrderShipped,
  notifySellerNewOrder,
  notifySellerWalletCredited,
  notifyVipActivated,
} from "./notifications";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /* ---------------------------- Catalog ---------------------------- */
  catalog: router({
    categories: publicProcedure.query(() => listCategories()),
    categoryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getCategoryBySlug(input.slug)),

    shops: publicProcedure
      .input(
        z
          .object({
            vipOnly: z.boolean().optional(),
            featured: z.boolean().optional(),
            categoryId: z.number().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(({ input }) => listShops(input)),

    shopBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const shop = await getShopBySlug(input.slug);
        if (!shop) return null;
        const items = await listProducts({ shopId: shop.id, limit: 60 });
        return { shop, products: items };
      }),

    products: publicProcedure
      .input(
        z
          .object({
            shopId: z.number().optional(),
            categoryId: z.number().optional(),
            flashOnly: z.boolean().optional(),
            search: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(({ input }) => listProducts(input)),

    productById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) return null;
        const shop = await getShopById(product.shopId);
        return { product, shop };
      }),

    homepage: publicProcedure.query(async () => {
      const [categoriesList, vipShops, featuredShops, flashDeals, vipProducts] = await Promise.all([
        listCategories(),
        listShops({ vipOnly: true, limit: 6 }),
        listShops({ featured: true, limit: 8 }),
        listProducts({ flashOnly: true, limit: 10 }),
        listProducts({ limit: 8 }),
      ]);
      return {
        categories: categoriesList,
        vipShops,
        featuredShops,
        flashDeals,
        vipProducts: vipProducts.slice(0, 4),
      };
    }),
  }),

  /* ---------------------------- Cart ---------------------------- */
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await listCartItems(ctx.user.id);
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          const shop = product ? await getShopById(product.shopId) : null;
          return { ...item, product, shop };
        })
      );
      return enriched.filter((i) => i.product && i.shop);
    }),
    add: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1).default(1) }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        await upsertCartItem(ctx.user.id, product.id, product.shopId, input.quantity);
        return { success: true };
      }),
    setQuantity: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        await upsertCartItem(ctx.user.id, product.id, product.shopId, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await removeCartItem(ctx.user.id, input.productId);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  /* ---------------------------- Shop (Seller) ---------------------------- */
  shop: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return null;
      const wallet = await ensureWallet(shop.id);
      const stats = await getShopStats(shop.id);
      return { shop, wallet, stats };
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2),
          description: z.string().optional(),
          city: z.string().optional(),
          region: z.string().optional(),
          categoryId: z.number().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          plan: z.enum(["basic", "vip"]).default("basic"),
          logoUrl: z.string().optional(),
          coverUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getShopByOwner(ctx.user.id);
        if (existing) throw new TRPCError({ code: "BAD_REQUEST", message: "Vous avez déjà une boutique" });
        const baseSlug = slugify(input.name) || nanoid(8);
        const slug = `${baseSlug}-${nanoid(4).toLowerCase()}`;
        const shop = await createShop({
          ownerId: ctx.user.id,
          slug,
          name: input.name,
          description: input.description ?? null,
          city: input.city ?? null,
          region: input.region ?? null,
          categoryId: input.categoryId ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          plan: "basic", // start as basic; VIP requires payment
          logoUrl: input.logoUrl ?? null,
          coverUrl: input.coverUrl ?? null,
          status: "active",
        });
        return shop;
      }),
    update: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).optional(),
          description: z.string().optional(),
          city: z.string().optional(),
          region: z.string().optional(),
          categoryId: z.number().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          logoUrl: z.string().optional(),
          coverUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const shop = await getShopByOwner(ctx.user.id);
        if (!shop) throw new TRPCError({ code: "NOT_FOUND" });
        return updateShop(shop.id, input);
      }),
    orders: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return [];
      return listOrderItemsByShop(shop.id);
    }),
    walletTransactions: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return [];
      return listWalletTransactions(shop.id);
    }),
    subscriptions: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return [];
      return listSubscriptionsByShop(shop.id);
    }),
  }),

  /* ---------------------------- Products (Seller) ---------------------------- */
  product: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return [];
      return listProducts({ shopId: shop.id, limit: 200 });
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2),
          description: z.string().optional(),
          kind: z.enum(["product", "service"]).default("product"),
          price: z.number().int().min(0),
          comparePrice: z.number().int().min(0).optional(),
          stock: z.number().int().min(0).default(1),
          categoryId: z.number().optional(),
          images: z.array(z.string()).default([]),
          isFlashDeal: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const shop = await getShopByOwner(ctx.user.id);
        if (!shop) throw new TRPCError({ code: "BAD_REQUEST", message: "Créez d'abord votre boutique" });
        const slug = `${slugify(input.name)}-${nanoid(4).toLowerCase()}`;
        return createProduct({
          shopId: shop.id,
          name: input.name,
          slug,
          description: input.description ?? null,
          kind: input.kind,
          price: input.price,
          comparePrice: input.comparePrice ?? null,
          stock: input.stock,
          categoryId: input.categoryId ?? null,
          images: input.images,
          isFlashDeal: input.isFlashDeal,
          status: "published",
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().int().min(0).optional(),
          comparePrice: z.number().int().min(0).optional(),
          stock: z.number().int().min(0).optional(),
          categoryId: z.number().optional(),
          images: z.array(z.string()).optional(),
          isFlashDeal: z.boolean().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.id);
        const shop = await getShopByOwner(ctx.user.id);
        if (!product || !shop || product.shopId !== shop.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...patch } = input;
        return updateProduct(id, patch);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.id);
        const shop = await getShopByOwner(ctx.user.id);
        if (!product || !shop || product.shopId !== shop.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  /* ---------------------------- Orders ---------------------------- */
  order: router({
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const list = await listOrdersByBuyer(ctx.user.id);
      const enriched = await Promise.all(
        list.map(async (o) => ({ order: o, items: await getOrderItems(o.id) }))
      );
      return enriched;
    }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await getOrderById(input.id);
        if (!order || order.buyerId !== ctx.user.id) {
          if (ctx.user.role !== "admin") throw new TRPCError({ code: "NOT_FOUND" });
        }
        const items = await getOrderItems(input.id);
        return order ? { order, items } : null;
      }),
    checkout: protectedProcedure
      .input(
        z.object({
          shippingAddress: z.object({
            fullName: z.string(),
            phone: z.string(),
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            region: z.string().optional(),
            country: z.string().default("Cameroun"),
          }),
          billingInfo: z
            .object({
              name: z.string(),
              email: z.string(),
              phone: z.string(),
              companyName: z.string().optional(),
              taxId: z.string().optional(),
            })
            .optional(),
          notes: z.string().optional(),
          saveAddress: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const items = await listCartItems(ctx.user.id);
        if (items.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Panier vide" });

        const orderItemsInput: Omit<Parameters<typeof createOrder>[1][number], "orderId">[] = [];
        let total = 0;
        for (const ci of items) {
          const product = await getProductById(ci.productId);
          if (!product) continue;
          const subtotal = product.price * ci.quantity;
          const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT);
          const shopAmount = subtotal - platformFee;
          total += subtotal;
          orderItemsInput.push({
            shopId: product.shopId,
            productId: product.id,
            productName: product.name,
            productImage: (product.images && (product.images as string[])[0]) || null,
            unitPrice: product.price,
            quantity: ci.quantity,
            subtotal,
            shopAmount,
            platformFee,
            status: "pending",
            dispatched: false,
          });
        }

        const platformFee = orderItemsInput.reduce((s, i) => s + (i.platformFee ?? 0), 0);
        const orderNumber = `LOU-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

        const orderId = await createOrder(
          {
            orderNumber,
            buyerId: ctx.user.id,
            totalAmount: total,
            shippingFee: 0,
            platformFee,
            status: "pending",
            paymentStatus: "pending",
            paymentProvider: "stripe",
            shippingAddress: input.shippingAddress,
            billingInfo: input.billingInfo ?? null,
            notes: input.notes ?? null,
          },
          orderItemsInput
        );

        if (input.saveAddress) {
          await createAddress({
            userId: ctx.user.id,
            ...input.shippingAddress,
            country: input.shippingAddress.country ?? "Cameroun",
          });
        }

        return { orderId, orderNumber, totalAmount: total };
      }),
    /** Simulated payment confirmation (would be called by Stripe webhook in production) */
    confirmPayment: protectedProcedure
      .input(z.object({ orderId: z.number(), paymentIntentId: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.buyerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (order.paymentStatus === "paid") return { alreadyPaid: true };

        await updateOrderStatus(order.id, {
          paymentStatus: "paid",
          status: "paid",
          paymentIntentId: input.paymentIntentId ?? `sim_${nanoid(16)}`,
        });

        // Dispatch funds to each shop's wallet
        const items = await getOrderItems(order.id);
        const byShop = new Map<number, number>();
        for (const it of items) {
          byShop.set(it.shopId, (byShop.get(it.shopId) ?? 0) + it.shopAmount);
        }
        for (const [shopId, amount] of Array.from(byShop.entries())) {
          await creditWallet(shopId, amount, order.id, `Commande ${order.orderNumber}`);
          const shop = await getShopById(shopId);
          const wallet = await getWalletByShop(shopId);
          if (shop) {
            await notifySellerNewOrder({
              shopName: shop.name,
              orderNumber: order.orderNumber,
              amount,
            });
            await notifySellerWalletCredited({
              shopName: shop.name,
              amount,
              newBalance: wallet?.balance ?? amount,
            });
          }
        }

        // Notify buyer
        const buyer = await getUserById(order.buyerId);
        await notifyBuyerOrderConfirmed({
          buyerEmail: buyer?.email ?? null,
          buyerName: buyer?.name ?? null,
          orderNumber: order.orderNumber,
          total: order.totalAmount,
        });

        // Clear cart on success
        await clearCart(ctx.user.id);

        return { success: true };
      }),
    addresses: protectedProcedure.query(({ ctx }) => listAddresses(ctx.user.id)),
    listForShop: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return [];
      const items = await listOrderItemsByShop(shop.id);
      const enriched = await Promise.all(
        items.map(async (item) => {
          const order = await getOrderById(item.orderId);
          return {
            item,
            order: order
              ? {
                  id: order.id,
                  orderNumber: order.orderNumber,
                  createdAt: order.createdAt,
                  customerName: (order.shippingAddress as { fullName?: string } | null)?.fullName ?? null,
                }
              : null,
          };
        })
      );
      return enriched;
    }),
    updateItemStatus: protectedProcedure
      .input(
        z.object({
          itemId: z.number(),
          status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const shop = await getShopByOwner(ctx.user.id);
        if (!shop) throw new TRPCError({ code: "FORBIDDEN" });
        const updated = await updateOrderItemStatus(input.itemId, input.status);
        if (!updated || updated.shopId !== shop.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (input.status === "shipped") {
          const order = await getOrderById(updated.orderId);
          if (order) {
            const buyer = await getUserById(order.buyerId);
            await notifyBuyerOrderShipped({
              buyerEmail: buyer?.email ?? null,
              orderNumber: order.orderNumber,
            });
          }
        }
        return { success: true };
      }),
  }),

  /* ---------------------------- Subscription (VIP) ---------------------------- */
  subscription: router({
    upgradeToVip: protectedProcedure.mutation(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) throw new TRPCError({ code: "BAD_REQUEST", message: "Créez d'abord votre boutique" });
      // In production, this would create a Stripe Checkout session
      // For now we simulate by activating directly
      const paymentIntentId = `sim_vip_${nanoid(16)}`;
      await activateVipSubscription(shop.id, paymentIntentId);
      await notifyVipActivated({
        shopName: shop.name,
        buyerEmail: ctx.user.email,
      });
      return {
        success: true,
        amount: VIP_PRICE_FCFA,
        paymentIntentId,
      };
    }),
  }),

  /* ---------------------------- Admin ---------------------------- */
  admin: router({
    stats: adminProcedure.query(() => getGlobalStats()),
    users: adminProcedure.query(() => listUsers()),
    shops: adminProcedure.query(() => listAllShops()),
    orders: adminProcedure.query(() => listAllOrders()),
    setShopStatus: adminProcedure
      .input(z.object({ shopId: z.number(), status: z.enum(["pending", "active", "suspended"]) }))
      .mutation(({ input }) => updateShop(input.shopId, { status: input.status })),
    setShopPlan: adminProcedure
      .input(z.object({ shopId: z.number(), plan: z.enum(["basic", "vip"]) }))
      .mutation(({ input }) => updateShop(input.shopId, { plan: input.plan })),
    setUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        await db.update(usersTbl).set({ role: input.role }).where(eq(usersTbl.id, input.userId));
        return { ok: true } as const;
      }),
    setOrderStatus: adminProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.orderId, { status: input.status });
        return { ok: true } as const;
      }),
  }),

  /* ---------------------------- Media (S3 upload) ---------------------------- */
  media: router({
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          contentType: z.string().min(1),
          dataBase64: z.string().min(1),
          kind: z.enum(["product", "shop-logo", "shop-cover"]).default("product"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.dataBase64, "base64");
        if (buffer.length > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image > 8 Mo" });
        }
        if (!input.contentType.startsWith("image/")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Type de fichier non supporté" });
        }
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
        const relKey = `loummel/${input.kind}/u${ctx.user.id}/${Date.now()}-${safeName}`;
        const out = await storagePut(relKey, buffer, input.contentType);
        return out;
      }),
  }),

  /* ---------------------------- Wallet ---------------------------- */
  wallet: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const shop = await getShopByOwner(ctx.user.id);
      if (!shop) return null;
      const wallet = await getWalletByShop(shop.id);
      const transactions = await listWalletTransactions(shop.id);
      return { wallet, transactions };
    }),
  }),
});

export type AppRouter = typeof appRouter;
