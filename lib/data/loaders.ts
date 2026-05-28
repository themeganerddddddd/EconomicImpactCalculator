import path from "node:path";
import { GEOGRAPHIES } from "../constants/geographies";
import { INDUSTRIES } from "../constants/industries";
import type { RegionalMultiplier } from "../impact/types";
import { readJsonFile } from "./cache";

const processed = (...parts: string[]) => path.resolve(process.cwd(), "data", "processed", ...parts);
const sample = (...parts: string[]) => path.resolve(process.cwd(), "data", "sample", ...parts);

export async function loadRegionalMultipliers(): Promise<{ multipliers: RegionalMultiplier[]; usedFallback: boolean }> {
  const processedData = await readJsonFile<RegionalMultiplier[]>(processed("regional_multipliers.json"));
  if (processedData?.length) return { multipliers: processedData, usedFallback: false };
  const sampleData = await readJsonFile<RegionalMultiplier[]>(sample("regional_multipliers.seed.json"));
  if (sampleData?.length) return { multipliers: sampleData, usedFallback: true };
  return { multipliers: buildInMemorySeedMultipliers(), usedFallback: true };
}

export function findMultiplier(multipliers: RegionalMultiplier[], geographyId: string, industryId: string): RegionalMultiplier | undefined {
  return multipliers.find((m) => m.geographyId === geographyId && m.industryId === industryId);
}

export function buildInMemorySeedMultipliers(): RegionalMultiplier[] {
  return GEOGRAPHIES.flatMap((geography, gIndex) =>
    INDUSTRIES.map((industry, iIndex) => {
      const regionScale = 0.78 + ((gIndex % 5) * 0.07);
      const industryScale = 0.88 + ((iIndex % 6) * 0.04);
      const employment = Math.round(650 + industry.outputPerWorker / 850 * regionScale * industryScale);
      const wages = employment * industry.averageWage;
      const estimatedOutput = employment * industry.outputPerWorker;
      const lq = Math.max(0.25, Math.min(2.4, regionScale * industryScale));
      const rpc = Math.min(0.95, Math.max(0.05, Math.sqrt(lq)));
      return {
        geographyId: geography.id,
        geographyName: geography.name,
        geographyType: geography.type,
        fips: geography.fips,
        industryId: industry.id,
        industryName: industry.name,
        naics: industry.naics,
        year: 2024,
        employment,
        wages,
        averageWage: industry.averageWage,
        establishments: Math.max(12, Math.round(employment / 18)),
        estimatedOutput,
        estimatedValueAdded: estimatedOutput * industry.valueAddedRatio,
        laborIncomeRatio: industry.laborIncomeRatio,
        valueAddedRatio: industry.valueAddedRatio,
        jobsPerMillionOutput: 1_000_000 / industry.outputPerWorker,
        locationQuotient: lq,
        regionalPurchaseCoefficient: rpc,
        indirectOutputMultiplier: industry.indirectOutputMultiplier * rpc,
        inducedSpendingMultiplier: industry.inducedSpendingMultiplier,
        outputMultiplier: 1 + industry.indirectOutputMultiplier * rpc + industry.inducedSpendingMultiplier * industry.laborIncomeRatio,
        dataQuality: "seed" as const,
        sourceNotes: [
          "Seed broad-sector ratio used until processed QCEW/BEA/CBP/ACS data is built.",
          "Regional purchase coefficient is derived from seed location quotient."
        ]
      };
    })
  );
}
