import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { INDUSTRIES } from "@/lib/constants/industries";
import { cacheDir, readJsonFile, writeJsonFile } from "@/lib/data/cache";
import { parseCsv } from "@/lib/data/csv";
import { toNumber } from "@/lib/data/normalize";
import fs from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";

interface CbpApiRow extends Record<string, string> {
  NAME: string;
  NAICS2017: string;
  NAICS2017_LABEL: string;
  ESTAB: string;
  EMP: string;
  PAYANN: string;
}

interface CbpDownloadRow {
  fipstate?: string;
  fipscty?: string;
  naics?: string;
  emp?: string;
  ap?: string;
  est?: string;
}

function splitFips(fips: string) {
  return { state: fips.slice(0, 2), county: fips.slice(2) };
}

function fromCensusTable<T extends Record<string, string>>(table: string[][]): T[] {
  const [header, ...rows] = table;
  if (!header) return [];
  return rows.map((row) => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])) as T);
}

async function fetchJsonWithCache<T>(url: string, cacheName: string) {
  const cachePath = path.join(cacheDir(), cacheName);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as T;
    await writeJsonFile(cachePath, data);
    return { data, status: "connected" as const };
  } catch {
    const cached = await readJsonFile<T>(cachePath);
    if (cached) return { data: cached, status: "cached" as const };
    throw new Error(`No live or cached data for ${cacheName}`);
  }
}

function aggregateCbp(rows: CbpApiRow[], industry: typeof INDUSTRIES[number]) {
  const exactRows = rows.filter((row) => industry.naics.some((code) => row.NAICS2017 === code));
  const prefixRows = exactRows.length ? exactRows : rows.filter((row) => industry.naics.some((code) => row.NAICS2017.startsWith(code)));
  return {
    establishments: prefixRows.reduce((sum, row) => sum + toNumber(row.ESTAB), 0),
    employment: prefixRows.reduce((sum, row) => sum + toNumber(row.EMP), 0),
    payroll: prefixRows.reduce((sum, row) => sum + toNumber(row.PAYANN) * 1000, 0),
    labels: prefixRows.slice(0, 5).map((row) => row.NAICS2017_LABEL)
  };
}

function aggregateCbpDownload(rows: CbpDownloadRow[], industry: typeof INDUSTRIES[number]) {
  const exactRows = rows.filter((row) => industry.naics.some((code) => row.naics === code));
  const prefixRows = exactRows.length ? exactRows : rows.filter((row) => industry.naics.some((code) => String(row.naics ?? "").startsWith(code)));
  return {
    establishments: prefixRows.reduce((sum, row) => sum + toNumber(row.est), 0),
    employment: prefixRows.reduce((sum, row) => sum + toNumber(row.emp), 0),
    payroll: prefixRows.reduce((sum, row) => sum + toNumber(row.ap) * 1000, 0),
    labels: prefixRows.slice(0, 5).map((row) => row.naics ?? "")
  };
}

async function loadCbpCountyDownload() {
  const zipPath = path.join(cacheDir(), "cbp23co.zip");
  const url = "https://www2.census.gov/programs-surveys/cbp/datasets/2023/cbp23co.zip";
  let bytes: Uint8Array;
  let status: "connected" | "cached" = "cached";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    bytes = new Uint8Array(await response.arrayBuffer());
    await fs.mkdir(cacheDir(), { recursive: true });
    await fs.writeFile(zipPath, bytes);
    status = "connected";
  } catch {
    bytes = new Uint8Array(await fs.readFile(zipPath));
  }

  const entries = unzipSync(bytes);
  const csvEntryName = Object.keys(entries).find((name) => /\.(csv|txt)$/i.test(name));
  if (!csvEntryName) throw new Error("No CSV/TXT file found inside cbp23co.zip");
  const text = new TextDecoder().decode(entries[csvEntryName]);
  return { rows: parseCsv(text) as CbpDownloadRow[], status };
}

async function fetchTextWithCache(url: string, cacheName: string) {
  const filePath = path.join(cacheDir(), cacheName);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    await fs.mkdir(cacheDir(), { recursive: true });
    await fs.writeFile(filePath, text);
    return { text, status: "connected" as const };
  } catch {
    return { text: await fs.readFile(filePath, "utf8"), status: "cached" as const };
  }
}

function parsePipeTable(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split("|");
  return new Map(lines.map((line) => {
    const cells = line.split("|");
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    return [row.GEO_ID, row];
  }));
}

async function loadAcsSummaryTables() {
  const base = "https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData";
  const [population, income, labor] = await Promise.all([
    fetchTextWithCache(`${base}/acsdt5y2023-b01003.dat`, "acsdt5y2023-b01003.dat"),
    fetchTextWithCache(`${base}/acsdt5y2023-b19013.dat`, "acsdt5y2023-b19013.dat"),
    fetchTextWithCache(`${base}/acsdt5y2023-b23025.dat`, "acsdt5y2023-b23025.dat")
  ]);
  const status = [population.status, income.status, labor.status].includes("connected") ? "connected" as const : "cached" as const;
  return {
    status,
    population: parsePipeTable(population.text),
    income: parsePipeTable(income.text),
    labor: parsePipeTable(labor.text)
  };
}

export async function ingestCBP() {
  const records = [];
  const warnings: string[] = [];

  try {
    const result = await loadCbpCountyDownload();
    for (const geography of GEOGRAPHIES) {
      const { state, county } = splitFips(geography.fips);
      const rows = result.rows.filter((row) => row.fipstate?.padStart(2, "0") === state && row.fipscty?.padStart(3, "0") === county);
      for (const industry of INDUSTRIES) {
        const aggregate = aggregateCbpDownload(rows, industry);
        records.push({
          geographyId: geography.id,
          fips: geography.fips,
          naics: industry.naics.join(","),
          industryId: industry.id,
          establishments: aggregate.establishments,
          employment: aggregate.employment,
          payroll: aggregate.payroll,
          year: 2023,
          source: "Census County Business Patterns downloadable county file",
          dataQuality: result.status,
          sourceLabels: aggregate.labels
        });
      }
    }
  } catch (downloadError) {
    warnings.push(`Official CBP county download failed: ${downloadError instanceof Error ? downloadError.message : "unknown error"}`);
  }

  if (!records.length) {
    for (const geography of GEOGRAPHIES) {
      const { state, county } = splitFips(geography.fips);
      const url = `https://api.census.gov/data/2023/cbp?get=NAME,NAICS2017,NAICS2017_LABEL,ESTAB,EMP,PAYANN&for=county:${county}&in=state:${state}&NAICS2017=*&LFO=001&EMPSZES=001`;
      try {
        const result = await fetchJsonWithCache<string[][]>(url, `cbp_2023_${geography.fips}.json`);
        const rows = fromCensusTable<CbpApiRow>(result.data);
        for (const industry of INDUSTRIES) {
          const aggregate = aggregateCbp(rows, industry);
          records.push({
            geographyId: geography.id,
            fips: geography.fips,
            naics: industry.naics.join(","),
            industryId: industry.id,
            establishments: aggregate.establishments,
            employment: aggregate.employment,
            payroll: aggregate.payroll,
            year: 2023,
            source: "Census County Business Patterns API",
            dataQuality: result.status,
            sourceLabels: aggregate.labels
          });
        }
      } catch (error) {
        warnings.push(`${geography.name}: ${error instanceof Error ? error.message : "CBP fetch failed"}`);
      }
    }
  }

  await writeJsonFile("data/processed/cbp_county_industry.json", records);
  return {
    status: records.some((record) => record.dataQuality === "connected") ? "connected" as const : "cached" as const,
    records: records.length,
    note: warnings.length ? `CBP loaded with warnings: ${warnings.join(" | ")}` : "Census 2023 CBP county-by-NAICS records loaded."
  };
}

export async function ingestACS() {
  const records = [];
  const warnings: string[] = [];

  try {
    const tables = await loadAcsSummaryTables();
    for (const geography of GEOGRAPHIES) {
      const geoId = `0500000US${geography.fips}`;
      const population = tables.population.get(geoId);
      const income = tables.income.get(geoId);
      const labor = tables.labor.get(geoId);
      if (!population || !income || !labor) {
        warnings.push(`${geography.name}: missing one or more ACS summary rows`);
        continue;
      }
      records.push({
        geographyId: geography.id,
        fips: geography.fips,
        name: geography.name,
        population: toNumber(population.B01003_E001),
        medianHouseholdIncome: toNumber(income.B19013_E001),
        laborForce: toNumber(labor.B23025_E003),
        employedResidents: toNumber(labor.B23025_E004),
        commutingLeakageProxy: geography.defaultLeakageAssumptions?.commutingLeakage ?? 0.3,
        year: 2023,
        source: "ACS 2023 5-year table-based summary files",
        dataQuality: tables.status
      });
    }
  } catch (downloadError) {
    warnings.push(`Official ACS summary files failed: ${downloadError instanceof Error ? downloadError.message : "unknown error"}`);
  }

  if (records.length) {
    await writeJsonFile("data/processed/acs_geography.json", records);
    return {
      status: records.some((record) => record.dataQuality === "connected") ? "connected" as const : "cached" as const,
      records: records.length,
      note: warnings.length ? `ACS summary files loaded with warnings: ${warnings.join(" | ")}` : "ACS 2023 5-year table-based summary files loaded."
    };
  }

  for (const geography of GEOGRAPHIES) {
    const { state, county } = splitFips(geography.fips);
    const vars = "NAME,B01003_001E,B19013_001E,B23025_003E,B23025_004E";
    const url = `https://api.census.gov/data/2023/acs/acs5?get=${vars}&for=county:${county}&in=state:${state}`;
    try {
      const result = await fetchJsonWithCache<string[][]>(url, `acs_2023_${geography.fips}.json`);
      const [row] = fromCensusTable<Record<string, string>>(result.data);
      records.push({
        geographyId: geography.id,
        fips: geography.fips,
        name: row.NAME,
        population: toNumber(row.B01003_001E),
        medianHouseholdIncome: toNumber(row.B19013_001E),
        laborForce: toNumber(row.B23025_003E),
        employedResidents: toNumber(row.B23025_004E),
        commutingLeakageProxy: geography.defaultLeakageAssumptions?.commutingLeakage ?? 0.3,
        year: 2023,
        source: "ACS 2023 5-year",
        dataQuality: result.status
      });
    } catch (error) {
      warnings.push(`${geography.name}: ${error instanceof Error ? error.message : "ACS fetch failed"}`);
    }
  }
  await writeJsonFile("data/processed/acs_geography.json", records);
  return {
    status: records.some((record) => record.dataQuality === "connected") ? "connected" as const : "cached" as const,
    records: records.length,
    note: warnings.length ? `ACS loaded with warnings: ${warnings.join(" | ")}` : "ACS 2023 5-year county context loaded."
  };
}
