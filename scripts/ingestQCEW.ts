import { ingestQCEW } from "@/lib/data/qcew";
import { isMain } from "./runGuard";

if (isMain(import.meta.url)) {
  ingestQCEW().then((result) => console.log(`QCEW loaded: ${result.records} records (${result.status}). ${result.note}`));
}

export { ingestQCEW };
