import { ingestACS } from "@/lib/data/acs";
import { isMain } from "./runGuard";

if (isMain(import.meta.url)) {
  ingestACS().then((result) => console.log(`ACS loaded: ${result.records} records (${result.status}). ${result.note}`));
}

export { ingestACS };
