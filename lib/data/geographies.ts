import path from "node:path";
import { GEOGRAPHIES } from "@/lib/constants/geographies";
import { readJsonFile } from "@/lib/data/cache";
import type { Geography } from "@/lib/impact/types";

export async function loadGeographies(): Promise<Geography[]> {
  const processed = await readJsonFile<Geography[]>(path.resolve(process.cwd(), "data", "processed", "geographies.json"));
  return processed?.length ? processed : GEOGRAPHIES;
}

export async function findGeography(idOrSlug: string): Promise<Geography | undefined> {
  const geographies = await loadGeographies();
  return geographies.find((geography) => geography.id === idOrSlug || geography.slug === idOrSlug || geography.fips === idOrSlug);
}
