"use client";

import type { ImpactResult } from "@/lib/impact/types";
import { formatCurrency, formatJobs, formatRange } from "@/lib/utils/formatters";
import ImpactSummaryCards from "@/components/ImpactSummaryCards";
import ImpactBreakdownChart from "@/components/ImpactBreakdownChart";
import JobsBreakdownChart from "@/components/JobsBreakdownChart";
import LeakageChart from "@/components/LeakageChart";
import AssumptionsTable from "@/components/AssumptionsTable";
import DownloadReportButton from "@/components/DownloadReportButton";
import { formatIndustryLabel } from "@/lib/constants/naicsLookup";

export default function ResultsDashboard({ result }: { result: ImpactResult }) {
  return (
    <section className="mt-8 space-y-6" id="results">
      <div className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Impact estimate for {result.geography.name}</h2>
          <p className="text-sm text-slate-700">{formatIndustryLabel(result.industry)}. Results are leakage-adjusted and net-new based on current assumptions.</p>
        </div>
        <div className="flex gap-2 no-print">
          <button type="button" onClick={() => window.print()} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Print</button>
          <DownloadReportButton result={result} />
        </div>
      </div>

      {result.warnings.map((warning) => (
        <div key={warning.code} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{warning.message}</div>
      ))}

      <ImpactSummaryCards result={result} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ImpactBreakdownChart result={result} />
        <JobsBreakdownChart result={result} />
        <LeakageChart result={result} />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Confidence Ranges: Low / Central / High</h3>
          {result.uncertainty ? (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Output:</span> {formatRange(result.uncertainty.totalOutput.p10, result.netTotal.output, result.uncertainty.totalOutput.p90)}</p>
              <p><span className="font-medium">Jobs:</span> {formatRange(result.uncertainty.totalJobs.p10, result.netTotal.jobs, result.uncertainty.totalJobs.p90, false)}</p>
              <p><span className="font-medium">Labor income:</span> {formatRange(result.uncertainty.totalLaborIncome.p10, result.netTotal.laborIncome, result.uncertainty.totalLaborIncome.p90)}</p>
              <p><span className="font-medium">Value added:</span> {formatRange(result.uncertainty.totalValueAdded.p10, result.netTotal.valueAdded, result.uncertainty.totalValueAdded.p90)}</p>
              <p><span className="font-medium">Fiscal impact:</span> {formatRange(result.uncertainty.fiscalImpact.p10, result.fiscalImpact.total, result.uncertainty.fiscalImpact.p90)}</p>
            </div>
          ) : <p className="text-sm text-slate-600">Confidence simulation is off for this run.</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Direct impact", result.direct],
          ["Indirect impact", result.indirect],
          ["Induced impact", result.induced]
        ].map(([label, item]) => {
          const b = item as ImpactResult["direct"];
          return <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold">{label as string}</h3><p className="mt-3 text-sm">Output: {formatCurrency(b.output)}</p><p className="text-sm">Jobs: {formatJobs(b.jobs)}</p><p className="text-sm">Labor income: {formatCurrency(b.laborIncome)}</p><p className="text-sm">Value added: {formatCurrency(b.valueAdded)}</p></div>;
        })}
      </div>

      <AssumptionsTable result={result} />
    </section>
  );
}
