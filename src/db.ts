import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  addresses,
  cartItems,
  categories,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  InsertShop,
  InsertSubscription,
  InsertUser,
  InsertWalletTransaction,
  orderItems,
  orders,
  products,
  shops,
  subscriptions,
  users,
  walletTransactions,
  wallets,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

/* ------------------------------ Users ------------------------------ */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function listUsers() {
  const db = await requireDb();
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(500);
}

/* ------------------------------ Categories ------------------------------ */

export async function listCategories() {
  const db = await requireDb();
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await requireDb();
  const r = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return r[0];
}

/* ------------------------------ Shops ------------------------------ */

export async function listShops(options?: { vipOnly?: boolean; featured?: boolean; limit?: number; categoryId?: number }) {
  const db = await requireDb();
  const conditions = [eq(shops.status, "active")];
  if (options?.vipOnly) conditions.push(eq(shops.plan, "vip"));
  if (options?.featured) conditions.push(eq(shops.featured, true));
  if (options?.categoryId) conditions.push(eq(shops.categoryId, options.categoryId));

  return db
    .select()
    .from(shops)
    .where(and(...conditions))
    .orderBy(desc(shops.rating), desc(shops.reviewsCount))
    .limit(options?.limit ?? 100);
}

export async function getShopBySlug(slug: string) {
  const db = await requireDb();
  const r = await db.select().from(shops).where(eq(shops.slug, slug)).limit(1);
  return r[0];
}

export async function getShopById(id: number) {
  const db = await requireDb();
  const r = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
  return r[0];
}

export async function getShopByOwner(ownerId: number) {
  const db = await requireDb();
  const r = await db.select().from(shops).where(eq(shops.ownerId, ownerId)).limit(1);
  return r[0];
}

export async function createShop(input: InsertShop) {
  const db = await requireDb();
  const r = await db.insert(shops).values(input).$returningId();
  const id = r[0]?.id;
  if (id) {
    await db.insert(wallets).values({ shopId: id });
  }
  return getShopById(id);
}

export async function updateShop(id: number, patch: Partial<InsertShop>) {
  const db = await requireDb();
  await db.update(shops).set(patch).where(eq(shops.id, id));
  return getShopById(id);
}

export async function listAllShops() {
  const db = await requireDb();
  return db.select().from(shops).orderBy(desc(shops.createdAt)).limit(500);
}

/* ------------------------------ Products ------------------------------ */

export async function listProducts(options?: {
  shopId?: number;
  categoryId?: number;
  flashOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await requireDb();
  const conditions = [eq(products.status, "published")];
  if (options?.shopId) conditions.push(eq(products.shopId, options.shopId));
  if (options?.categoryId) conditions.push(eq(products.categoryId, options.categoryId));
  if (options?.flashOnly) conditions.push(eq(products.isFlashDeal, true));
  if (options?.search) {
    conditions.push(or(like(products.name, `%${options.search}%`), like(products.description, `%${options.search}%`))!);
  }
  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.sold), desc(products.createdAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);
}

export async function getProductById(id: number) {
  const db = await requireDb();
  const r = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return r[0];
}

export async function getProductBySlug(slug: string) {
  const db = await requireDb();
  const r = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return r[0];
}

export async function createProduct(input: InsertProduct) {
  const db = await requireDb();
  const r = await db.insert(products).values(input).$returningId();
  return getProductById(r[0].id);
}

export async function updateProduct(id: number, patch: Partial<InsertProduct>) {
  const db = await requireDb();
  await db.update(products).set(patch).where(eq(products.id, id));
  return getProductById(id);
}

export async function deleteProduct(id: number) {
  const db = await requireDb();
  await db.delete(products).where(eq(products.id, id));
}

/* ------------------------------ Cart ------------------------------ */

export async function listCartItems(userId: number) {
  const db = await requireDb();
  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function upsertCartItem(userId: number, productId: number, shopId: number, quantity: number) {
  const db = await requireDb();
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, existing[0].id));
    return existing[0].id;
  }
  const r = await db.insert(cartItems).values({ userId, productId, shopId, quantity }).$returningId();
  return r[0].id;
}

export async function removeCartItem(userId: number, productId: number) {
  const db = await requireDb();
  await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
}

export async function clearCart(userId: number) {
  const db = await requireDb();
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

/* ------------------------------ Orders ------------------------------ */

export async function createOrder(input: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]) {
  const db = await requireDb();
  const r = await db.insert(orders).values(input).$returningId();
  const orderId = r[0].id;
  for (const it of items) {
    await db.insert(orderItems).values({ ...it, orderId });
  }
  return orderId;
}

export async function getOrderById(id: number) {
  const db = await requireDb();
  const r = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return r[0];
}

export async function getOrderItems(orderId: number) {
  const db = await requireDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function listOrdersByBuyer(buyerId: number) {
  const db = await requireDb();
  return db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
}

export async function listAllOrders() {
  const db = await requireDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
}

export async function listOrderItemsByShop(shopId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(orderItems)
    .where(eq(orderItems.shopId, shopId))
    .orderBy(desc(orderItems.createdAt));
}

export async function updateOrderItemStatus(id: number, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
  const db = await requireDb();
  await db.update(orderItems).set({ status }).where(eq(orderItems.id, id));
  const r = await db.select().from(orderItems).where(eq(orderItems.id, id)).limit(1);
  return r[0];
}

export async function updateOrderStatus(id: number, patch: Partial<InsertOrder>) {
  const db = await requireDb();
  await db.update(orders).set(patch).where(eq(orders.id, id));
  return getOrderById(id);
}

/* ------------------------------ Wallets ------------------------------ */

export async function getWalletByShop(shopId: number) {
  const db = await requireDb();
  const r = await db.select().from(wallets).where(eq(wallets.shopId, shopId)).limit(1);
  return r[0];
}

export async function ensureWallet(shopId: number) {
  const existing = await getWalletByShop(shopId);
  if (existing) return existing;
  const db = await requireDb();
  await db.insert(wallets).values({ shopId });
  return getWalletByShop(shopId);
}

export async function listWalletTransactions(shopId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.shopId, shopId))
    .orderBy(desc(walletTransactions.createdAt));
}

export async function creditWallet(shopId: number, amount: number, orderId?: number, description?: string) {
  const db = await requireDb();
  const wallet = await ensureWallet(shopId);
  if (!wallet) throw new Error("Wallet not found");
  const newBalance = wallet.balance + amount;
  await db
    .update(wallets)
    .set({ balance: newBalance, totalEarned: wallet.totalEarned + amount })
    .where(eq(wallets.id, wallet.id));
  const tx: InsertWalletTransaction = {
    walletId: wallet.id,
    shopId,
    orderId: orderId ?? null,
    type: "credit",
    amount,
    balanceAfter: newBalance,
    description: description ?? "Crédit suite à une commande",
    status: "completed",
  };
  await db.insert(walletTransactions).values(tx);
  return newBalance;
}

/* ------------------------------ Subscriptions ------------------------------ */

export async function createSubscription(input: InsertSubscription) {
  const db = await requireDb();
  const r = await db.insert(subscriptions).values(input).$returningId();
  return r[0].id;
}

export async function activateVipSubscription(shopId: number, paymentIntentId: string) {
  const db = await requireDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  await createSubscription({
    shopId,
    plan: "vip",
    amount: 15000,
    status: "active",
    paymentIntentId,
    startedAt: now,
    expiresAt,
  });
  await db
    .update(shops)
    .set({ plan: "vip", vipExpiresAt: expiresAt })
    .where(eq(shops.id, shopId));
}

export async function listSubscriptionsByShop(shopId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.shopId, shopId))
    .orderBy(desc(subscriptions.createdAt));
}

/* ------------------------------ Addresses ------------------------------ */

export async function listAddresses(userId: number) {
  const db = await requireDb();
  return db.select().from(addresses).where(eq(addresses.userId, userId));
}

export async function createAddress(input: typeof addresses.$inferInsert) {
  const db = await requireDb();
  const r = await db.insert(addresses).values(input).$returningId();
  return r[0].id;
}

/* ------------------------------ Stats ------------------------------ */

export async function getShopStats(shopId: number) {
  const db = await requireDb();
  const totalProducts = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products)
    .where(eq(products.shopId, shopId));
  const totalSales = await db
    .select({ count: sql<number>`COUNT(*)`, revenue: sql<number>`COALESCE(SUM(${orderItems.shopAmount}),0)` })
    .from(orderItems)
    .where(eq(orderItems.shopId, shopId));
  return {
    products: Number(totalProducts[0]?.count ?? 0),
    orders: Number(totalSales[0]?.count ?? 0),
    revenue: Number(totalSales[0]?.revenue ?? 0),
  };
}

export async function getGlobalStats() {
  const db = await requireDb();
  const u = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const s = await db.select({ count: sql<number>`COUNT(*)` }).from(shops);
  const p = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
  const o = await db
    .select({
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}),0)`,
    })
    .from(orders);
  return {
    users: Number(u[0]?.count ?? 0),
    shops: Number(s[0]?.count ?? 0),
    products: Number(p[0]?.count ?? 0),
    orders: Number(o[0]?.count ?? 0),
    revenue: Number(o[0]?.revenue ?? 0),
  };
}
