import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { cachedFetchJson, readJsonFile, writeJsonFile } from "@/lib/data/cache";
import { toNumber } from "@/lib/data/normalize";

interface BeaApiResponse {
  BEAAPI?: {
    Results?: {
      Data?: BeaDataRow[];
      Error?: unknown;
    };
  };
}

interface BeaDataRow {
  GeoFips: string;
  GeoName: string;
  TimePeriod: string;
  LineCode: string;
  Description: string;
  DataValue: string;
  UNIT_MULT?: string;
  CL_UNIT?: string;
}

function beaUrl(key: string, geoFips: string, lineCode: number) {
  const params = new URLSearchParams({
    UserID: key,
    method: "GetData",
    datasetname: "Regional",
    TableName: "CAINC1",
    LineCode: String(lineCode),
    GeoFips: geoFips,
    Year: "LAST5",
    ResultFormat: "JSON"
  });
  return `https://apps.bea.gov/api/data?${params.toString()}`;
}

function latest(data: BeaDataRow[]) {
  return [...data].sort((a, b) => String(b.TimePeriod).localeCompare(String(a.TimePeriod)))[0];
}

export async function ingestBEARegional() {
  const key = process.env.BEA_API_KEY;
  if (!key) {
    const cached = await readJsonFile<unknown>("data/processed/bea_regional.json");
    if (cached) return { status: "cached" as const, records: 1, note: "BEA_API_KEY missing; using cached processed BEA regional benchmarks." };
    return { status: "fallback" as const, records: 0, note: "BEA_API_KEY missing; using seed regional benchmarks." };
  }
  const records = [];
  let status: "connected" | "cached" | "fallback" = "fallback";
  const warnings: string[] = [];

  for (const geography of GEOGRAPHIES) {
    try {
      const income = await cachedFetchJson<BeaApiResponse>(beaUrl(key, geography.fips, 1), `bea_cainc1_income_${geography.fips}.json`);
      const perCapita = await cachedFetchJson<BeaApiResponse>(beaUrl(key, geography.fips, 3), `bea_cainc1_percapita_${geography.fips}.json`);
      const incomeRows = income.data?.BEAAPI?.Results?.Data ?? [];
      const perCapitaRows = perCapita.data?.BEAAPI?.Results?.Data ?? [];
      const latestIncome = latest(incomeRows);
      const latestPerCapita = latest(perCapitaRows);
      if (!latestIncome) throw new Error("No CAINC1 personal income rows returned");
      records.push({
        geographyId: geography.id,
        fips: geography.fips,
        geographyName: geography.name,
        year: toNumber(latestIncome.TimePeriod),
        personalIncome: toNumber(String(latestIncome.DataValue).replace(/,/g, "")) * 1000,
        perCapitaPersonalIncome: latestPerCapita ? toNumber(String(latestPerCapita.DataValue).replace(/,/g, "")) : null,
        source: "BEA Regional CAINC1",
        dataQuality: income.status === "connected" || perCapita.status === "connected" ? "connected" : "cached"
      });
      if (income.status === "connected" || perCapita.status === "connected") status = "connected";
      else if (status !== "connected") status = "cached";
    } catch (error) {
      warnings.push(`${geography.name}: ${error instanceof Error ? error.message : "BEA fetch failed"}`);
    }
  }

  await writeJsonFile("data/processed/bea_regional.json", {
    status,
    records,
    note: "BEA Regional CAINC1 county personal income and per-capita personal income benchmarks.",
    fetchedAt: new Date().toISOString()
  });
  return {
    status,
    records: records.length,
    note: warnings.length ? `BEA regional benchmarks loaded with warnings: ${warnings.join(" | ")}` : "BEA Regional CAINC1 county benchmarks loaded."
  };
}
