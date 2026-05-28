import { loadEnvConfig } from "@next/env";
import { ingestBEARegional } from "@/lib/data/bea";
import { isMain } from "./runGuard";

loadEnvConfig(process.cwd());

if (isMain(import.meta.url)) {
  ingestBEARegional().then((result) => console.log(`BEA loaded: ${result.records} records (${result.status}). ${result.note}`));
}

export { ingestBEARegional };
