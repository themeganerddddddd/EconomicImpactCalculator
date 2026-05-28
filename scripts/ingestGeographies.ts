import fs from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";
import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { cacheDir, writeJsonFile } from "@/lib/data/cache";
import type { Geography } from "@/lib/impact/types";
import { isMain } from "./runGuard";

function slugifyCounty(name: string, state: string) {
  return `${name.toLowerCase().replace(/ county| parish| borough| census area| municipality/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${state.toLowerCase()}`;
}

function parseGazetteer(text: string): Geography[] {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift()?.trim().split(/\t+/) ?? [];
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const stateByFips = new Map(GEOGRAPHIES.map((g) => [g.fips.slice(0, 2), g.state]));
  return lines.map((line) => {
    const cells = line.trim().split(/\t+/);
    const fips = cells[index.GEOID];
    const name = cells[index.NAME];
    const state = stateByFips.get(fips.slice(0, 2)) ?? cells[index.USPS] ?? "";
    return {
      id: slugifyCounty(name, state),
      slug: slugifyCounty(name, state),
      name: `${name}, ${state}`,
      type: name.toLowerCase().includes("city") ? "city" : "county",
      state,
      fips
    } satisfies Geography;
  }).filter((g) => g.fips && g.name);
}

export async function ingestGeographies() {
  const url = "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_counties_national.zip";
  const zipPath = path.join(cacheDir(), "county_gazetteer.zip");
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
  const txtName = Object.keys(entries).find((name) => /\.txt$/i.test(name));
  if (!txtName) throw new Error("No county gazetteer text file found.");
  const geographies = parseGazetteer(new TextDecoder().decode(entries[txtName]));
  const preferred = GEOGRAPHIES.map((g) => ({ ...g, hasProcessedMultipliers: true }));
  const seen = new Set(preferred.map((g) => g.fips));
  const merged = [...preferred, ...geographies.filter((g) => !seen.has(g.fips))];
  await writeJsonFile("data/processed/geographies.json", merged);
  return { status, records: merged.length, note: "Census county gazetteer loaded; processed multiplier counties are listed first." };
}

if (isMain(import.meta.url)) {
  ingestGeographies().then((result) => console.log(`Geographies loaded: ${result.records} records (${result.status}). ${result.note}`));
}
