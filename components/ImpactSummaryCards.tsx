"use client";

import type { ImpactResult } from "@/lib/impact/types";
import { formatCurrency, formatJobs, formatPercent } from "@/lib/utils/formatters";

export default function ImpactSummaryCards({ result }: { result: ImpactResult }) {
  const cards = [
    ["Total jobs supported", formatJobs(result.netTotal.jobs)],
    ["Annual jobs supported", formatJobs(result.annualJobsSupported)],
    ["Job-years", formatJobs(result.jobYears)],
    ["Total output", formatCurrency(result.netTotal.output)],
    ["GDP / value added", formatCurrency(result.netTotal.valueAdded)],
    ["Labor income", formatCurrency(result.netTotal.laborIncome)],
    ["Fiscal impact", formatCurrency(result.fiscalImpact.total)],
    ["Leakage", `${formatCurrency(result.leakageAmount)} (${formatPercent(result.leakageRate)})`],
    ["Local retained impact", formatCurrency(result.localRetainedImpact)]
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
      ))}
    </div>
  );
}
