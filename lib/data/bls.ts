import { writeJsonFile } from "@/lib/data/cache";

export async function ingestBLSCpi() {
  if (!process.env.BLS_API_KEY) return { status: "fallback" as const, note: "BLS_API_KEY missing; CPI refresh skipped." };
  await writeJsonFile("data/processed/bls_cpi.json", { status: "planned", note: "CPI API integration placeholder.", fetchedAt: new Date().toISOString() });
  return { status: "planned" as const, note: "CPI connector scaffolded." };
}
