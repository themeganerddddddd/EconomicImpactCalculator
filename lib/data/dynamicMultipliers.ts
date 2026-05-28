import { getIndustry } from "@/lib/constants/industries";
import { buildQcewRecordsForGeography } from "@/lib/data/qcew";
import { calculateLQ, calculateRegionalPurchaseCoefficient } from "@/lib/impact/regionalization";
import type { Geography, RegionalMultiplier } from "@/lib/impact/types";

export async function buildDynamicCountyMultiplier(geography: Geography, industryId: string): Promise<RegionalMultiplier | null> {
  const industry = getIndustry(industryId);
  if (!industry) return null;
  const countyRecords = await buildQcewRecordsForGeography(geography);
  const nationalRecords = await buildQcewRecordsForGeography({ id: "united-states", fips: "US000" });
  const q = countyRecords.find((record) => record.industryId === industry.id);
  if (!q) return null;
  const regionTotalEmployment = countyRecords.reduce((sum, record) => sum + record.annualAverageEmployment, 0);
  const nationalTotalEmployment = nationalRecords.reduce((sum, record) => sum + record.annualAverageEmployment, 0);
  const nationalIndustry = nationalRecords.find((record) => record.industryId === industry.id);
  const employment = q.annualAverageEmployment || 1;
  const wages = q.annualWages || employment * industry.averageWage;
  const averageWage = employment > 0 ? wages / employment : industry.averageWage;
  const lq = calculateLQ(employment, regionTotalEmployment || employment, nationalIndustry?.annualAverageEmployment || employment, nationalTotalEmployment || employment);
  const rpc = calculateRegionalPurchaseCoefficient(lq);
  const wageAdjustedOutputPerWorker = industry.outputPerWorker * Math.max(0.65, Math.min(1.8, averageWage / industry.averageWage));
  const estimatedOutput = employment * wageAdjustedOutputPerWorker;
  return {
    geographyId: geography.id,
    geographyName: geography.name,
    geographyType: geography.type,
    fips: geography.fips,
    industryId: industry.id,
    industryName: industry.name,
    naics: industry.naics,
    year: q.year,
    employment,
    wages,
    averageWage,
    establishments: q.establishments,
    estimatedOutput,
    estimatedValueAdded: estimatedOutput * industry.valueAddedRatio,
    laborIncomeRatio: Math.max(0.08, Math.min(0.85, wages / Math.max(1, estimatedOutput))),
    valueAddedRatio: industry.valueAddedRatio,
    jobsPerMillionOutput: estimatedOutput > 0 ? employment / (estimatedOutput / 1_000_000) : 1_000_000 / industry.outputPerWorker,
    locationQuotient: lq,
    regionalPurchaseCoefficient: rpc,
    indirectOutputMultiplier: industry.indirectOutputMultiplier * rpc,
    inducedSpendingMultiplier: industry.inducedSpendingMultiplier,
    outputMultiplier: 1 + industry.indirectOutputMultiplier * rpc + industry.inducedSpendingMultiplier * industry.laborIncomeRatio,
    dataQuality: q.dataQuality,
    sourceNotes: [
      "This county was resolved from the data-driven Census county list and calculated on demand from official BLS QCEW annual area CSV data.",
      "CBP, ACS, and BEA benchmark supplements may be unavailable until the full refresh pipeline is expanded for this county.",
      "Output-per-worker, value-added, and base IO ratio assumptions remain transparent broad-sector seed ratios until full BEA IO matrix parsing is completed."
    ]
  };
}
