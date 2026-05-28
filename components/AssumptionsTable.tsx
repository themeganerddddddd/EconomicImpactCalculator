"use client";

import type { ImpactResult } from "@/lib/impact/types";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { formatIndustryLabel } from "@/lib/constants/naicsLookup";

export default function AssumptionsTable({ result }: { result: ImpactResult }) {
  const rows = [
    ["Selected industry", formatIndustryLabel(result.industry), "Industry name and primary NAICS code"],
    ["Average wage", formatCurrency(result.assumptions.averageWage), result.assumptions.averageWageSource],
    ["Direct output", formatCurrency(result.assumptions.directOutput), result.assumptions.directOutputSource],
    ["Local purchase share", formatPercent(result.assumptions.localPurchaseShare), "User or geography default"],
    ["Net-new share", formatPercent(result.assumptions.netNewShare), "User assumption"],
    ["Commuting leakage", formatPercent(result.assumptions.commutingLeakage), "ACS/geography proxy or user assumption"],
    ["RPC", formatPercent(result.multiplier.regionalPurchaseCoefficient), "Location quotient regionalization"],
    ["Data quality", result.multiplier.dataQuality, result.sourceNotes.join(" ")]
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700"><tr><th className="p-3">Assumption</th><th className="p-3">Value</th><th className="p-3">Source / note</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row[0]} className="border-t border-slate-200"><td className="p-3 font-medium">{row[0]}</td><td className="p-3">{row[1]}</td><td className="p-3 text-slate-600">{row[2]}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
