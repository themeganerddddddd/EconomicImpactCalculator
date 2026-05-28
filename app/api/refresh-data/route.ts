import { NextResponse } from "next/server";
import { ingestBEARegional } from "@/lib/data/bea";
import { ingestQCEW } from "@/lib/data/qcew";
import { ingestCBP, ingestACS } from "@/lib/data/census";
import { buildRegionalMultipliers } from "@/scripts/buildRegionalMultipliers";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DATA_REFRESH !== "true") {
    return NextResponse.json({ error: "Data refresh is disabled in production unless ALLOW_DATA_REFRESH=true." }, { status: 403 });
  }
  const qcew = await ingestQCEW();
  const bea = await ingestBEARegional();
  const cbp = await ingestCBP();
  const acs = await ingestACS();
  const multipliers = await buildRegionalMultipliers();
  return NextResponse.json({ qcew, bea, cbp, acs, multipliers });
}
