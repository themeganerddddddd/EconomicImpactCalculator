export type RPCMode = "conservative" | "standard" | "aggressive";

export function calculateLQ(regionIndustryEmployment: number, regionTotalEmployment: number, nationalIndustryEmployment: number, nationalTotalEmployment: number): number {
  if (regionIndustryEmployment <= 0 || regionTotalEmployment <= 0 || nationalIndustryEmployment <= 0 || nationalTotalEmployment <= 0) return 0.5;
  return (regionIndustryEmployment / regionTotalEmployment) / (nationalIndustryEmployment / nationalTotalEmployment);
}

export function calculateRPC(locationQuotient: number): number {
  return Math.min(0.95, Math.max(0.05, Math.sqrt(Math.max(0, locationQuotient))));
}

export function calculateRegionalPurchaseCoefficient(locationQuotient: number, mode: RPCMode = "standard"): number {
  if (mode === "conservative") return Math.min(0.9, Math.max(0.05, Math.sqrt(Math.max(0, locationQuotient)) * 0.85));
  if (mode === "aggressive") return Math.min(1, Math.max(0.05, locationQuotient));
  return calculateRPC(locationQuotient);
}

export function estimateRegionalMultiplier(nationalMultiplier: number, rpc: number): number {
  return Math.max(0, 1 + (Math.max(1, nationalMultiplier) - 1) * rpc);
}

export function calculateCILQ(regionIndustryAEmployment: number, regionIndustryBEmployment: number, nationalIndustryAEmployment: number, nationalIndustryBEmployment: number): number {
  if (regionIndustryBEmployment <= 0 || nationalIndustryBEmployment <= 0 || nationalIndustryAEmployment <= 0) return 1;
  return (regionIndustryAEmployment / regionIndustryBEmployment) / (nationalIndustryAEmployment / nationalIndustryBEmployment);
}

export function calculateFLQ(locationQuotient: number, regionEmployment: number, nationalEmployment: number, delta = 0.3): number {
  // Flegg location quotient adjusts simple LQ by regional size: lambda = [log2(1 + E_r/E_US)]^delta.
  // For tiny or missing regions, fall back to the simple LQ to avoid false precision.
  if (regionEmployment <= 0 || nationalEmployment <= 0) return locationQuotient;
  const lambda = Math.pow(Math.log2(1 + regionEmployment / nationalEmployment), delta);
  return Math.max(0.05, locationQuotient * lambda);
}
