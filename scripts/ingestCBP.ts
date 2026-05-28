import { ingestCBP } from "@/lib/data/census";
import { isMain } from "./runGuard";

if (isMain(import.meta.url)) {
  ingestCBP().then((result) => console.log(`CBP loaded: ${result.records} records (${result.status}). ${result.note}`));
}

export { ingestCBP };
