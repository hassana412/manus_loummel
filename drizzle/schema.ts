import { boolean, decimal, int, json, mysqlEnum, mysqlTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Users
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  icon: varchar("icon", { length: 64 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Shops
 */
export const shops = mysqlTable("shops", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  coverUrl: text("coverUrl"),
  city: varchar("city", { length: 120 }),
  region: varchar("region", { length: 120 }),
  categoryId: int("categoryId"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  plan: mysqlEnum("plan", ["basic", "vip"]).default("basic").notNull(),
  vipExpiresAt: timestamp("vipExpiresAt"),
  status: mysqlEnum("status", ["pending", "active", "suspended"]).default("active").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  reviewsCount: int("reviewsCount").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;

/**
 * Products & Services
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull(),
  description: text("description"),
  kind: mysqlEnum("kind", ["product", "service"]).default("product").notNull(),
  price: int("price").notNull(), // FCFA, stored as integer
  comparePrice: int("comparePrice"), // original price for discount display
  stock: int("stock").default(0).notNull(),
  images: json("images").$type<string[]>().$defaultFn(() => []).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  sold: int("sold").default(0).notNull(),
  views: int("views").default(0).notNull(),
  isFlashDeal: boolean("isFlashDeal").default(false).notNull(),
  flashEndsAt: timestamp("flashEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Wallets (one per shop)
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull().unique(),
  balance: int("balance").default(0).notNull(), // FCFA
  pending: int("pending").default(0).notNull(),
  totalEarned: int("totalEarned").default(0).notNull(),
  totalWithdrawn: int("totalWithdrawn").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Wallet transactions
 */
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  shopId: int("shopId").notNull(),
  orderId: int("orderId"),
  type: mysqlEnum("type", ["credit", "debit", "withdrawal", "refund", "fee"]).notNull(),
  amount: int("amount").notNull(), // FCFA
  balanceAfter: int("balanceAfter").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Addresses
 */
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fullName: varchar("fullName", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: varchar("city", { length: 120 }).notNull(),
  region: varchar("region", { length: 120 }),
  country: varchar("country", { length: 80 }).default("Cameroun").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Orders (one per buyer, may include items from multiple shops)
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  buyerId: int("buyerId").notNull(),
  totalAmount: int("totalAmount").notNull(),
  shippingFee: int("shippingFee").default(0).notNull(),
  platformFee: int("platformFee").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentProvider: varchar("paymentProvider", { length: 32 }),
  paymentIntentId: varchar("paymentIntentId", { length: 191 }),
  shippingAddress: json("shippingAddress"),
  billingInfo: json("billingInfo"),
  invoiceUrl: text("invoiceUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items (each linked to a shop for wallet dispatch)
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  shopId: int("shopId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 220 }).notNull(),
  productImage: text("productImage"),
  unitPrice: int("unitPrice").notNull(),
  quantity: int("quantity").notNull(),
  subtotal: int("subtotal").notNull(),
  shopAmount: int("shopAmount").notNull(), // amount to dispatch to the shop wallet
  platformFee: int("platformFee").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  dispatched: boolean("dispatched").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Subscriptions (VIP)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  shopId: int("shopId").notNull(),
  plan: mysqlEnum("plan", ["basic", "vip"]).notNull(),
  amount: int("amount").notNull(), // 15000 FCFA for VIP
  status: mysqlEnum("status", ["pending", "active", "expired", "cancelled"]).default("pending").notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 191 }),
  startedAt: timestamp("startedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Cart items (persistent cart per user)
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  shopId: int("shopId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
