import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | EconomicImpactCalculator",
  description: "Planning estimate disclaimer for EconomicImpactCalculator."
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Disclaimer</h1>
      <p className="mt-4 rounded-lg border border-slate-200 bg-white p-5 leading-7 text-slate-700 shadow-sm">This calculator provides planning estimates using public data and transparent assumptions. It is not an official forecast, certified impact study, or substitute for a full professional economic impact analysis. Results depend on user inputs, data availability, model assumptions, and regional economic conditions.</p>
    </main>
  );
}
