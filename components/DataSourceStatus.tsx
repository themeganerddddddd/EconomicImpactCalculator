import type { DataSourceStatus as Status } from "@/lib/impact/types";

const statuses: Status[] = [
  { sourceName: "BEA Input-Output Accounts", status: "planned", notes: "Parser scaffolded; broad-sector seed ratios used for MVP until full matrix import is completed." },
  { sourceName: "BEA Regional Economic Accounts", status: "cached", notes: "Server-side connector reads BEA_API_KEY and caches CAINC1 county personal-income benchmarks where available." },
  { sourceName: "BLS QCEW", status: "cached", notes: "Primary county-industry backbone using official annual area CSV slices for employment, wages, establishments, and annual pay." },
  { sourceName: "Census County Business Patterns", status: "cached", notes: "Supplements establishments, payroll, and employment structure from the 2023 CBP API." },
  { sourceName: "ACS", status: "cached", notes: "Supports population, household income, labor force, employed residents, and leakage proxy assumptions from ACS 2023 5-year data." },
  { sourceName: "BLS CPI", status: "planned", notes: "Inflation adjustment connector is scaffolded for future refreshes." }
];

export default function DataSourceStatus() {
  return (
    <div className="grid gap-3">
      {statuses.map((source) => (
        <div key={source.sourceName} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">{source.sourceName}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{source.status}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{source.notes}</p>
        </div>
      ))}
    </div>
  );
}
