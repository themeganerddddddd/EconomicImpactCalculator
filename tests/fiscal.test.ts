import { describe, expect, it } from "vitest";
import { estimateFiscalImpact } from "../lib/impact/fiscal";

describe("fiscal", () => {
  it("can disable fiscal estimate", () => {
    expect(estimateFiscalImpact({ mode: "none", netLaborIncome: 100, disposableLocalIncome: 100, netValueAdded: 100 }).total).toBe(0);
  });

  it("calculates simple fiscal impact", () => {
    expect(estimateFiscalImpact({ mode: "simple", netLaborIncome: 1_000_000, disposableLocalIncome: 600_000, netValueAdded: 2_000_000 }).total).toBeGreaterThan(0);
  });
});
