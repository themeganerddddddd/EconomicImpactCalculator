import { describe, expect, it } from "vitest";
import { calculateFLQ, calculateLQ, calculateRegionalPurchaseCoefficient } from "../lib/impact/regionalization";

describe("regionalization", () => {
  it("calculates location quotient and RPC modes", () => {
    const lq = calculateLQ(100, 1000, 500, 10000);
    expect(lq).toBeCloseTo(2);
    expect(calculateRegionalPurchaseCoefficient(lq, "conservative")).toBeLessThan(calculateRegionalPurchaseCoefficient(lq, "aggressive"));
  });

  it("calculates FLQ with bounded fallback behavior", () => {
    expect(calculateFLQ(1.2, 1000, 100000)).toBeGreaterThan(0.05);
  });
});
