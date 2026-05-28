import type { Metadata } from "next";
import CalculatorForm from "@/components/CalculatorForm";

export const metadata: Metadata = {
  title: "Calculator | EconomicImpactCalculator",
  description: "Estimate direct, indirect, induced, net-new, leakage-adjusted, fiscal, and confidence-range impacts for local economic development projects."
};

export default function CalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">EconomicImpactCalculator</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Economic Impact Calculator</h1>
        <p className="mt-3 max-w-4xl text-slate-700">Enter project, geography, industry, spending, and assumption details. Calculations use local processed data where available, can resolve additional counties from public data, and show source notes with every result.</p>
      </div>
      <div className="mt-6"><CalculatorForm /></div>
    </main>
  );
}
