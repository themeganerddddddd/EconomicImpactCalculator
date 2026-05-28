import { loadEnvConfig } from "@next/env";
import { ingestBEARegional } from "@/lib/data/bea";
import { ingestQCEW } from "@/lib/data/qcew";
import { ingestCBP, ingestACS } from "@/lib/data/census";
import { buildRegionalMultipliers } from "@/scripts/buildRegionalMultipliers";
import { ingestGeographies } from "@/scripts/ingestGeographies";

loadEnvConfig(process.cwd());

async function main() {
  const qcew = await ingestQCEW();
  const geographies = await ingestGeographies();
  const bea = await ingestBEARegional();
  const cbp = await ingestCBP();
  const acs = await ingestACS();
  const multipliers = await buildRegionalMultipliers();
  const rows = [
    ["QCEW loaded or cached", `${qcew.status}: ${qcew.records} records`],
    ["Geographies loaded or cached", `${geographies.status}: ${geographies.records} records`],
    ["BEA loaded or cached", `${bea.status}: ${bea.records} records`],
    ["CBP loaded or cached", `${cbp.status}: ${cbp.records} records`],
    ["ACS loaded or cached", `${acs.status}: ${acs.records} records`],
    ["Multipliers built", `${multipliers.status}: ${multipliers.records} records`],
    ["Fallbacks used", [qcew, bea, cbp, acs, multipliers].filter((r) => r.status === "fallback" || r.status === "seed").map((r) => r.note).join(" | ") || "None"]
  ];
  for (const [label, value] of rows) console.log(`${label}: ${value}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
