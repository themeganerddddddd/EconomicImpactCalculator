import { writeJsonFile } from "@/lib/data/cache";
import { buildInMemorySeedMultipliers } from "@/lib/data/loaders";
import { readJsonFile } from "@/lib/data/cache";
import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { INDUSTRIES } from "@/lib/constants/industries";
import { calculateLQ, calculateRegionalPurchaseCoefficient } from "@/lib/impact/regionalization";
import type { RegionalMultiplier } from "@/lib/impact/types";
import { isMain } from "./runGuard";

interface QcewRecord {
  geographyId: string;
  industryId: string;
  annualAverageEmployment: number;
  annualWages: number;
  establishments: number;
  averageAnnualWage: number;
  year: number;
  dataQuality: "connected" | "cached" | "fallback";
}

interface CbpRecord {
  geographyId: string;
  industryId: string;
  establishments: number;
  employment: number;
  payroll: number;
  dataQuality: "connected" | "cached" | "fallback";
}

interface AcsRecord {
  geographyId: string;
  population: number;
  medianHouseholdIncome: number;
  laborForce: number;
  employedResidents: number;
  commutingLeakageProxy: number;
  dataQuality: "connected" | "cached" | "fallback";
}

interface BeaProcessed {
  records?: Array<{
    geographyId: string;
    personalIncome: number;
    perCapitaPersonalIncome: number | null;
    dataQuality: "connected" | "cached" | "fallback";
  }>;
}

function byKey<T extends { geographyId: string; industryId?: string }>(records: T[]) {
  return new Map(records.map((record) => [`${record.geographyId}:${record.industryId ?? ""}`, record]));
}

function quality(...qualities: Array<string | undefined>): RegionalMultiplier["dataQuality"] {
  if (qualities.includes("connected")) return "connected";
  if (qualities.includes("cached")) return "cached";
  if (qualities.includes("fallback")) return "fallback";
  return "seed";
}

export async function buildRegionalMultipliers() {
  const qcew = await readJsonFile<QcewRecord[]>("data/processed/qcew_county_industry.json");
  const cbp = await readJsonFile<CbpRecord[]>("data/processed/cbp_county_industry.json") ?? [];
  const acs = await readJsonFile<AcsRecord[]>("data/processed/acs_geography.json") ?? [];
  const bea = await readJsonFile<BeaProcessed>("data/processed/bea_regional.json");

  const seed = buildInMemorySeedMultipliers();
  await writeJsonFile("data/sample/regional_multipliers.seed.json", seed.map((m) => ({ ...m, dataQuality: "seed" })));

  if (!qcew?.length) {
    await writeJsonFile("data/processed/regional_multipliers.json", seed);
    return { status: "seed" as const, records: seed.length, note: "No processed QCEW records found; wrote seed multiplier fallback." };
  }

  const qcewMap = byKey(qcew);
  const cbpMap = byKey(cbp);
  const acsMap = new Map(acs.map((record) => [record.geographyId, record]));
  const beaMap = new Map((bea?.records ?? []).map((record) => [record.geographyId, record]));
  const usRecords = qcew.filter((record) => record.geographyId === "united-states");
  const nationalTotalEmployment = usRecords.reduce((sum, record) => sum + record.annualAverageEmployment, 0);

  const multipliers: RegionalMultiplier[] = [];

  for (const geography of GEOGRAPHIES) {
    const regionRecords = qcew.filter((record) => record.geographyId === geography.id);
    const regionTotalEmployment = regionRecords.reduce((sum, record) => sum + record.annualAverageEmployment, 0);
    const acsRecord = acsMap.get(geography.id);
    const beaRecord = beaMap.get(geography.id);

    for (const industry of INDUSTRIES) {
      const q = qcewMap.get(`${geography.id}:${industry.id}`);
      const n = qcewMap.get(`united-states:${industry.id}`);
      const c = cbpMap.get(`${geography.id}:${industry.id}`);
      const seedRecord = seed.find((record) => record.geographyId === geography.id && record.industryId === industry.id)!;
      const employment = q?.annualAverageEmployment && q.annualAverageEmployment > 0 ? q.annualAverageEmployment : c?.employment || seedRecord.employment;
      const wages = q?.annualWages && q.annualWages > 0 ? q.annualWages : c?.payroll || employment * industry.averageWage;
      const establishments = q?.establishments && q.establishments > 0 ? q.establishments : c?.establishments || seedRecord.establishments;
      const averageWage = employment > 0 ? wages / employment : industry.averageWage;
      const nationalIndustryEmployment = n?.annualAverageEmployment && n.annualAverageEmployment > 0 ? n.annualAverageEmployment : seedRecord.employment;
      const lq = calculateLQ(employment, regionTotalEmployment || acsRecord?.employedResidents || employment, nationalIndustryEmployment, nationalTotalEmployment || nationalIndustryEmployment);
      const rpc = calculateRegionalPurchaseCoefficient(lq, "standard");
      const wageAdjustedOutputPerWorker = industry.outputPerWorker * Math.max(0.65, Math.min(1.8, averageWage / industry.averageWage));
      const estimatedOutput = employment * wageAdjustedOutputPerWorker;
      const estimatedValueAdded = estimatedOutput * industry.valueAddedRatio;
      const beaBenchmarkNote = beaRecord?.personalIncome
        ? `BEA county personal income benchmark loaded (${beaRecord.dataQuality}); per-capita personal income ${beaRecord.perCapitaPersonalIncome ?? "not available"}.`
        : "BEA benchmark unavailable for this geography.";

      multipliers.push({
        geographyId: geography.id,
        geographyName: geography.name,
        geographyType: geography.type,
        fips: geography.fips,
        industryId: industry.id,
        industryName: industry.name,
        naics: industry.naics,
        year: q?.year ?? 2024,
        employment,
        wages,
        averageWage,
        establishments,
        estimatedOutput,
        estimatedValueAdded,
        laborIncomeRatio: Math.max(0.08, Math.min(0.85, wages > 0 && estimatedOutput > 0 ? wages / estimatedOutput : industry.laborIncomeRatio)),
        valueAddedRatio: industry.valueAddedRatio,
        jobsPerMillionOutput: estimatedOutput > 0 ? employment / (estimatedOutput / 1_000_000) : 1_000_000 / industry.outputPerWorker,
        locationQuotient: lq,
        regionalPurchaseCoefficient: rpc,
        indirectOutputMultiplier: industry.indirectOutputMultiplier * rpc,
        inducedSpendingMultiplier: industry.inducedSpendingMultiplier * Math.max(0.85, Math.min(1.15, (acsRecord?.medianHouseholdIncome || industry.averageWage) / Math.max(1, industry.averageWage))),
        outputMultiplier: 1 + industry.indirectOutputMultiplier * rpc + industry.inducedSpendingMultiplier * industry.laborIncomeRatio,
        dataQuality: quality(q?.dataQuality, c?.dataQuality, acsRecord?.dataQuality, beaRecord?.dataQuality),
        sourceNotes: [
          "Employment, wages, establishments, and average wage are derived primarily from BLS QCEW annual area CSV slices.",
          c ? "Census CBP supplements establishments/payroll where QCEW rows are suppressed or unavailable." : "Census CBP supplement unavailable for this industry/geography.",
          acsRecord ? "ACS 2023 5-year county context loaded for population, income, and labor force." : "ACS context unavailable; geography defaults are used for leakage assumptions.",
          beaBenchmarkNote,
          "Output-per-worker, value-added, and base IO ratio assumptions remain transparent broad-sector seed ratios until full BEA IO matrix parsing is completed."
        ]
      });
    }
  }

  await writeJsonFile("data/processed/regional_multipliers.json", multipliers);
  return {
    status: multipliers.some((record) => record.dataQuality === "connected") ? "connected" as const : "cached" as const,
    records: multipliers.length,
    note: "Built regional multipliers from real QCEW/CBP/ACS/BEA processed data with transparent broad-sector IO ratio assumptions."
  };
}

if (isMain(import.meta.url)) {
  buildRegionalMultipliers().then((result) => console.log(`Multipliers built: ${result.records} records (${result.status})`));
}
