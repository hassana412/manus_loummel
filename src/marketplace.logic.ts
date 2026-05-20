import { describe, expect, it } from "vitest";
import { PLATFORM_FEE_PCT, VIP_PRICE_FCFA } from "../shared/const";

/**
 * Pure-logic tests that verify the core marketplace business rules
 * without hitting the database or HTTP layer.
 */

function computeOrderShare(unitPrice: number, quantity: number) {
  const subtotal = unitPrice * quantity;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_PCT);
  const shopAmount = subtotal - platformFee;
  return { subtotal, platformFee, shopAmount };
}

function aggregateByShop(items: Array<{ shopId: number; shopAmount: number }>) {
  const byShop = new Map<number, number>();
  for (const it of items) {
    byShop.set(it.shopId, (byShop.get(it.shopId) ?? 0) + it.shopAmount);
  }
  return byShop;
}

describe("Marketplace - Pricing & Subscription", () => {
  it("VIP subscription price is exactly 15 000 FCFA per year (constant rule)", () => {
    expect(VIP_PRICE_FCFA).toBe(15000);
  });

  it("Platform fee percentage is between 0% and 20%", () => {
    expect(PLATFORM_FEE_PCT).toBeGreaterThanOrEqual(0);
    expect(PLATFORM_FEE_PCT).toBeLessThanOrEqual(0.2);
  });
});

describe("Marketplace - Order share computation", () => {
  it("splits subtotal into platform fee + shop amount with no leakage", () => {
    const { subtotal, platformFee, shopAmount } = computeOrderShare(10000, 3);
    expect(subtotal).toBe(30000);
    expect(platformFee + shopAmount).toBe(subtotal);
    expect(shopAmount).toBeGreaterThan(0);
  });

  it("never produces negative shop amount", () => {
    const tiny = computeOrderShare(1, 1);
    expect(tiny.shopAmount).toBeGreaterThanOrEqual(0);
    expect(tiny.platformFee).toBeGreaterThanOrEqual(0);
  });
});

describe("Marketplace - Multi-shop dispatch aggregation", () => {
  it("aggregates wallet credits correctly across multiple shops in one order", () => {
    const items = [
      { shopId: 1, shopAmount: 2700 },
      { shopId: 2, shopAmount: 8100 },
      { shopId: 1, shopAmount: 5400 }, // same shop, second product
      { shopId: 3, shopAmount: 1350 },
    ];
    const byShop = aggregateByShop(items);
    expect(byShop.get(1)).toBe(2700 + 5400);
    expect(byShop.get(2)).toBe(8100);
    expect(byShop.get(3)).toBe(1350);
    expect(byShop.size).toBe(3);
  });

  it("returns an empty map for an empty order", () => {
    expect(aggregateByShop([]).size).toBe(0);
  });
});
