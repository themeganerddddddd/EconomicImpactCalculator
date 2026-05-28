"use client";

import type { ImpactResult } from "@/lib/impact/types";
import { formatIndustryLabel } from "@/lib/constants/naicsLookup";

export default function DownloadReportButton({ result }: { result: ImpactResult }) {
  function download() {
    const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), industryLabel: formatIndustryLabel(result.industry), disclaimer: "Planning estimate, not an official forecast or certified impact study.", result }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `economicimpactcalculator-${result.geography.slug}-${result.industry.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return <button type="button" onClick={download} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Download Report JSON</button>;
}
