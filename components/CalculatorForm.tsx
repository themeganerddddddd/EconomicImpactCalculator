"use client";

import { useEffect, useState } from "react";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { Geography, ImpactResult, Industry, ProjectType } from "@/lib/impact/types";
import { formatIndustryLabel } from "@/lib/constants/naicsLookup";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";
const labelClass = "text-sm font-semibold text-slate-800";

export default function CalculatorForm() {
  const [geographies, setGeographies] = useState<Geography[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [result, setResult] = useState<ImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [geographyQuery, setGeographyQuery] = useState("");
  const [industryQuery, setIndustryQuery] = useState("");
  const [form, setForm] = useState({
    geographyId: "montgomery-county-md",
    industryId: "life-sciences-rd",
    projectType: "expansion" as ProjectType,
    directJobs: 100,
    averageWage: 95000,
    directOutput: 0,
    constructionSpending: 0,
    timeHorizonYears: 5,
    constructionDurationYears: 1,
    localPurchaseShare: 0.6,
    netNewShare: 0.75,
    commutingLeakage: 0.3,
    taxRate: 0.18,
    savingsRate: 0.08,
    confidenceMode: "standard",
    fiscalEstimateMode: "simple"
  });

  useEffect(() => {
    Promise.all([fetch("/api/geographies").then((r) => r.json()), fetch("/api/industries").then((r) => r.json())]).then(([g, i]) => {
      setGeographies(g.geographies);
      setIndustries(i.industries);
    });
  }, []);

  function update(key: string, value: string) {
    const numeric = ["directJobs", "averageWage", "directOutput", "constructionSpending", "timeHorizonYears", "constructionDurationYears", "localPurchaseShare", "netNewShare", "commutingLeakage", "taxRate", "savingsRate"].includes(key);
    setForm((current) => ({ ...current, [key]: numeric ? Number(value) : value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setErrors([]);
    setResult(null);
    const response = await fetch("/api/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setErrors(payload.errors ?? [payload.error ?? "Calculation failed."]);
      return;
    }
    setResult(payload.result);
  }

  const selectedGeography = geographies.find((g) => g.id === form.geographyId);
  const filteredGeographies = geographies.filter((g) => `${g.name} ${g.fips}`.toLowerCase().includes(geographyQuery.toLowerCase())).slice(0, 250);
  const geographyOptions = selectedGeography && !filteredGeographies.some((g) => g.id === selectedGeography.id) ? [selectedGeography, ...filteredGeographies] : filteredGeographies;
  const selectedIndustry = industries.find((i) => i.id === form.industryId);
  const filteredIndustries = industries.filter((i) => `${formatIndustryLabel(i)} ${i.name} ${i.naics.join(" ")}`.toLowerCase().includes(industryQuery.toLowerCase()));
  const industryOptions = selectedIndustry && !filteredIndustries.some((i) => i.id === selectedIndustry.id) ? [selectedIndustry, ...filteredIndustries] : filteredIndustries;

  return (
    <>
      <form onSubmit={submit} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 md:px-7">
          <h2 className="text-xl font-semibold text-slate-950">Project Inputs</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">Search by county, FIPS, industry name, or NAICS code. Public-data assumptions can be reviewed and adjusted before calculating.</p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">
          <label className={labelClass}>Search counties<input className={inputClass} value={geographyQuery} onChange={(e) => setGeographyQuery(e.target.value)} placeholder="County name or FIPS" /></label>
          <label className={labelClass}>Geography<select className={inputClass} value={form.geographyId} onChange={(e) => update("geographyId", e.target.value)}>{geographyOptions.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.fips})</option>)}</select></label>
          <label className={labelClass}>Search industries or NAICS<input className={inputClass} value={industryQuery} onChange={(e) => setIndustryQuery(e.target.value)} placeholder="Example: physicians or 621111" /></label>
          <label className={labelClass}>Industry<select className={inputClass} value={form.industryId} onChange={(e) => update("industryId", e.target.value)}>{industryOptions.map((i) => <option key={i.id} value={i.id}>{formatIndustryLabel(i)}</option>)}</select></label>
          <label className={labelClass}>Project type<select className={inputClass} value={form.projectType} onChange={(e) => update("projectType", e.target.value)}><option value="new-employer">New employer</option><option value="expansion">Expansion</option><option value="construction">Construction</option><option value="operations">Operations</option><option value="mixed">Mixed</option></select></label>
          <label className={labelClass}>Time horizon years<input className={inputClass} type="number" min="1" max="30" value={form.timeHorizonYears} onChange={(e) => update("timeHorizonYears", e.target.value)} /></label>
        </div>

        <div className="border-t border-slate-200 px-5 py-5 md:px-7">
          <h3 className="text-lg font-semibold text-slate-950">Activity and Spending</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <label className={labelClass}>Direct jobs<input className={inputClass} type="number" min="0" value={form.directJobs} onChange={(e) => update("directJobs", e.target.value)} /></label>
            <label className={labelClass}>Average wage<input className={inputClass} type="number" min="0" value={form.averageWage} onChange={(e) => update("averageWage", e.target.value)} /></label>
            <label className={labelClass}>Direct annual output/spending<input className={inputClass} type="number" min="0" value={form.directOutput} onChange={(e) => update("directOutput", e.target.value)} /></label>
            <label className={labelClass}>Construction spending<input className={inputClass} type="number" min="0" value={form.constructionSpending} onChange={(e) => update("constructionSpending", e.target.value)} /></label>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 md:px-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Assumptions and Default Values</h3>
              <p className="mt-1 text-sm text-slate-600">Default values offer literature-informed, conservative figures. Users should replace these assumptions with project-specific or local data when available.</p>
            </div>
            <button type="button" onClick={() => setAdvanced(!advanced)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">{advanced ? "Hide" : "Show"} Advanced</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Local purchase", form.localPurchaseShare], ["Net-new", form.netNewShare], ["Commuting leakage", form.commutingLeakage], ["Savings rate", form.savingsRate]].map(([label, value]) => <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs uppercase tracking-wide text-slate-500">{label as string}</p><p className="mt-1 text-lg font-semibold text-slate-950">{Math.round(Number(value) * 100)}%</p></div>)}
          </div>
          {advanced && (
            <div className="mt-5 grid gap-5 border-t border-slate-200 pt-5 md:grid-cols-3">
              <label className={labelClass}>Construction duration<input className={inputClass} type="number" min="1" max="30" value={form.constructionDurationYears} onChange={(e) => update("constructionDurationYears", e.target.value)} /></label>
              <label className={labelClass}>Local purchase share<input className={inputClass} type="number" step="0.01" min="0" max="1" value={form.localPurchaseShare} onChange={(e) => update("localPurchaseShare", e.target.value)} /></label>
              <label className={labelClass}>Net-new share<input className={inputClass} type="number" step="0.01" min="0" max="1" value={form.netNewShare} onChange={(e) => update("netNewShare", e.target.value)} /></label>
              <label className={labelClass}>Commuting leakage<input className={inputClass} type="number" step="0.01" min="0" max="1" value={form.commutingLeakage} onChange={(e) => update("commutingLeakage", e.target.value)} /></label>
              <label className={labelClass}>Tax rate<input className={inputClass} type="number" step="0.01" min="0" max="0.6" value={form.taxRate} onChange={(e) => update("taxRate", e.target.value)} /></label>
              <label className={labelClass}>Savings rate<input className={inputClass} type="number" step="0.01" min="0" max="0.8" value={form.savingsRate} onChange={(e) => update("savingsRate", e.target.value)} /></label>
              <label className={labelClass}>Confidence<select className={inputClass} value={form.confidenceMode} onChange={(e) => update("confidenceMode", e.target.value)}><option value="standard">Standard</option><option value="wide">Wide</option><option value="off">Off</option></select></label>
              <label className={labelClass}>Fiscal estimate<select className={inputClass} value={form.fiscalEstimateMode} onChange={(e) => update("fiscalEstimateMode", e.target.value)}><option value="simple">Simple</option><option value="custom">Custom tax rates</option><option value="none">None</option></select></label>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-5 py-5 md:px-7">
          {errors.length > 0 && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errors.map((e) => <p key={e}>{e}</p>)}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-teal-700 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:opacity-60 md:w-auto">{loading ? "Calculating..." : "Calculate Impact"}</button>
        </div>
      </form>
      {result && <ResultsDashboard result={result} />}
    </>
  );
}
