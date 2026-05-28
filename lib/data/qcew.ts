import path from "node:path";
import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { INDUSTRIES } from "@/lib/constants/industries";
import { cacheDir, ensureDir, readJsonFile, writeJsonFile } from "@/lib/data/cache";
import { parseCsv } from "@/lib/data/csv";
import { toNumber } from "@/lib/data/normalize";

export interface QcewRecord {
  countyFips: string;
  geographyId: string;
  naics: string;
  industryId: string;
  annualAverageEmployment: number;
  annualWages: number;
  establishments: number;
  averageAnnualWage: number;
  year: number;
  ownership: string;
  source: "BLS QCEW";
  dataQuality: "connected" | "cached" | "fallback";
}

interface RawQcewRow {
  area_fips: string;
  own_code: string;
  industry_code: string;
  annual_avg_estabs: string;
  annual_avg_emplvl: string;
  total_annual_wages: string;
  avg_annual_pay: string;
  year: string;
}

const QCEW_YEARS = [2024, 2023, 2022];

function normalizeIndustryCode(code: string) {
  return code.replace(/_/g, "-").trim();
}

function rowMatchesIndustry(row: RawQcewRow, code: string) {
  const rowCode = normalizeIndustryCode(row.industry_code);
  return rowCode === code || rowCode.replace("-", "") === code;
}

function pickRows(rows: RawQcewRow[], naics: string[]) {
  const candidates = rows.filter((row) => row.own_code === "5" && row.industry_code !== "10");
  const fallback = rows.filter((row) => row.own_code === "0" && row.industry_code !== "10");
  const picked: RawQcewRow[] = [];
  for (const code of naics) {
    const exact = candidates.find((row) => rowMatchesIndustry(row, code)) ?? fallback.find((row) => rowMatchesIndustry(row, code));
    if (exact) picked.push(exact);
  }
  if (picked.length) return picked;
  return candidates.filter((row) => naics.some((code) => normalizeIndustryCode(row.industry_code).startsWith(code))).slice(0, 12);
}

export async function fetchQcewArea(areaFips: string) {
  const lastError: string[] = [];
  for (const year of QCEW_YEARS) {
    const fileName = `qcew_${year}_${areaFips}.json`;
    const cachePath = path.join(cacheDir(), fileName);
    try {
      const response = await fetch(`https://data.bls.gov/cew/data/api/${year}/a/area/${areaFips}.csv`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = parseCsv(await response.text()) as unknown as RawQcewRow[];
      await writeJsonFile(cachePath, rows);
      return { rows, year, status: "connected" as const };
    } catch (error) {
      lastError.push(error instanceof Error ? error.message : "unknown");
      const cached = await readJsonFile<RawQcewRow[]>(cachePath);
      if (cached?.length) return { rows: cached, year, status: "cached" as const };
    }
  }
  throw new Error(`QCEW area ${areaFips} unavailable: ${lastError.join("; ")}`);
}

export async function buildQcewRecordsForGeography(geography: { id: string; fips: string }) {
  const area = await fetchQcewArea(geography.fips);
  return INDUSTRIES.map((industry) => {
    const rows = pickRows(area.rows, industry.naics);
    const employment = rows.reduce((sum, row) => sum + toNumber(row.annual_avg_emplvl), 0);
    const wages = rows.reduce((sum, row) => sum + toNumber(row.total_annual_wages), 0);
    return {
      countyFips: geography.fips,
      geographyId: geography.id,
      naics: industry.naics.join(","),
      industryId: industry.id,
      annualAverageEmployment: employment,
      annualWages: wages,
      establishments: rows.reduce((sum, row) => sum + toNumber(row.annual_avg_estabs), 0),
      averageAnnualWage: employment > 0 ? wages / employment : industry.averageWage,
      year: area.year,
      ownership: "Private ownership (own_code 5) preferred; total covered ownership used only when private rows are unavailable or suppressed.",
      source: "BLS QCEW" as const,
      dataQuality: area.status
    };
  });
}

export async function ingestQCEW() {
  await ensureDir(cacheDir());
  const records: QcewRecord[] = [];
  const warnings: string[] = [];

  for (const geography of GEOGRAPHIES) {
    try {
      const area = await fetchQcewArea(geography.fips);
      for (const industry of INDUSTRIES) {
        const rows = pickRows(area.rows, industry.naics);
        const employment = rows.reduce((sum, row) => sum + toNumber(row.annual_avg_emplvl), 0);
        const wages = rows.reduce((sum, row) => sum + toNumber(row.total_annual_wages), 0);
        const establishments = rows.reduce((sum, row) => sum + toNumber(row.annual_avg_estabs), 0);
        records.push({
          countyFips: geography.fips,
          geographyId: geography.id,
          naics: industry.naics.join(","),
          industryId: industry.id,
          annualAverageEmployment: employment,
          annualWages: wages,
          establishments,
          averageAnnualWage: employment > 0 ? wages / employment : industry.averageWage,
          year: area.year,
          ownership: "Private ownership (own_code 5) preferred; total covered ownership used only when private rows are unavailable or suppressed.",
          source: "BLS QCEW",
          dataQuality: area.status
        });
      }
    } catch (error) {
      warnings.push(`${geography.name}: ${error instanceof Error ? error.message : "QCEW fetch failed"}`);
    }
  }

  const usArea = await fetchQcewArea("US000").catch(() => null);
  if (usArea) {
    for (const industry of INDUSTRIES) {
      const rows = pickRows(usArea.rows, industry.naics);
      const employment = rows.reduce((sum, row) => sum + toNumber(row.annual_avg_emplvl), 0);
      const wages = rows.reduce((sum, row) => sum + toNumber(row.total_annual_wages), 0);
      records.push({
        countyFips: "US000",
        geographyId: "united-states",
        naics: industry.naics.join(","),
        industryId: industry.id,
        annualAverageEmployment: employment,
        annualWages: wages,
        establishments: rows.reduce((sum, row) => sum + toNumber(row.annual_avg_estabs), 0),
        averageAnnualWage: employment > 0 ? wages / employment : industry.averageWage,
        year: usArea.year,
        ownership: "Private ownership preferred; total covered ownership used only when private rows are unavailable.",
        source: "BLS QCEW",
        dataQuality: usArea.status
      });
    }
  }

  if (!records.length) throw new Error(`No QCEW records built. ${warnings.join(" | ")}`);
  await writeJsonFile("data/processed/qcew_county_industry.json", records);
  const connected = records.some((record) => record.dataQuality === "connected");
  return {
    status: connected ? "connected" as const : "cached" as const,
    records: records.length,
    note: warnings.length ? `BLS QCEW loaded with warnings: ${warnings.join(" | ")}` : "BLS QCEW annual area CSV slices loaded for selected counties and US benchmark."
  };
}
