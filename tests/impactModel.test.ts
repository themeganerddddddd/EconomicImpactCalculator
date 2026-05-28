import { describe, expect, it } from "vitest";
import { GEOGRAPHIES } from "../lib/constants/geographies";
import { INDUSTRIES } from "../lib/constants/industries";
import { buildInMemorySeedMultipliers } from "../lib/data/loaders";
import { calculateImpact } from "../lib/impact/model";
import type { UserInputs } from "../lib/impact/types";
import { validateInputs } from "../lib/impact/validation";

const geography = GEOGRAPHIES[0];
const industry = INDUSTRIES[0];
const multiplier = buildInMemorySeedMultipliers().find((m) => m.geographyId === geography.id && m.industryId === industry.id)!;

const baseInput: UserInputs = {
  geographyId: geography.id,
  industryId: industry.id,
  projectType: "expansion",
  directJobs: 100,
  averageWage: 100000,
  directOutput: 0,
  constructionSpending: 0,
  timeHorizonYears: 5,
  constructionDurationYears: 1,
  localPurchaseShare: 0.6,
  netNewShare: 0.75,
  commutingLeakage: 0.3,
  taxRate: 0.18,
  savingsRate: 0.08,
  confidenceMode: "standard",
  fiscalEstimateMode: "simple"
};

describe("impact model", () => {
  it("calculates direct, induced, net-new, leakage, and fiscal impacts", () => {
    const result = calculateImpact(baseInput, geography, industry, multiplier);
    expect(result.direct.output).toBeGreaterThan(0);
    expect(result.induced.output).toBeGreaterThan(0);
    expect(result.netTotal.output).toBeCloseTo(result.grossTotal.output * baseInput.netNewShare);
    expect(result.leakageAmount).toBeCloseTo(result.grossTotal.output - result.netTotal.output);
    expect(result.fiscalImpact.total).toBeGreaterThan(0);
  });

  it("returns Monte Carlo output shape", () => {
    const result = calculateImpact(baseInput, geography, industry, multiplier);
    expect(result.uncertainty?.totalOutput.p10).toBeGreaterThan(0);
    expect(result.uncertainty?.totalOutput.p90).toBeGreaterThan(result.uncertainty?.totalOutput.p10 ?? 0);
  });

  it("does not return NaN or Infinity in totals", () => {
    const result = calculateImpact(baseInput, geography, industry, multiplier);
    for (const value of Object.values(result.netTotal)) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("uses fallback wage selection when wage is blank", () => {
    const result = calculateImpact({ ...baseInput, averageWage: undefined }, geography, industry, multiplier);
    expect(result.assumptions.averageWage).toBe(multiplier.averageWage);
    expect(result.assumptions.averageWageSource).toContain("fallback");
  });

  it("validates bounds", () => {
    expect(validateInputs({ ...baseInput, netNewShare: 1.5 })).toContain("Net-new share must be between 0 and 1.");
  });
});
