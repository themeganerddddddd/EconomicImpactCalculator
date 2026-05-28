import Link from "next/link";
import type { Geography } from "@/lib/impact/types";
import { INDUSTRIES } from "@/lib/constants/industries";

export default function SEOCountyIndustryBlock({ geography }: { geography: Geography }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Economic Impact Calculator for {geography.name}</h2>
      <p className="text-slate-700">Estimate local jobs, output, GDP/value added, labor income, fiscal impact, and leakage for projects in {geography.name}. The calculator uses transparent assumptions and public-data-inspired regional multiplier profiles.</p>
      <div className="flex flex-wrap gap-2">
        {INDUSTRIES.slice(0, 8).map((industry) => <span key={industry.id} className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-900">{industry.name}</span>)}
      </div>
      <p className="text-sm text-slate-600">Methodology note: estimates are planning ranges, not certified forecasts. Data-source notes and fallback status are shown with each result.</p>
      <Link href="/calculator" className="inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Start Calculator</Link>
    </section>
  );
}
