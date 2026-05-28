import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | EconomicImpactCalculator",
  description: "EconomicImpactCalculator is a public, transparent economic impact tool for local planning estimates."
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">About EconomicImpactCalculator</h1>
      <p className="mt-4 leading-7 text-slate-700">EconomicImpactCalculator is a public, transparent economic impact tool designed to make local impact analysis more accessible. It focuses on explainable estimates, visible assumptions, public-data methodology, and careful uncertainty language.</p>
      <p className="mt-4 leading-7 text-slate-700">The project is similar in concept to input-output tools used by analysts, but it is intentionally open-methodology and cautious about leakage, net-new assumptions, and data quality.</p>
      <p className="mt-4 rounded-lg border border-slate-200 bg-white p-4 leading-7 text-slate-700 shadow-sm">For questions, corrections, or requests for additional information, please contact <a className="font-semibold text-teal-700" href="mailto:weststurhan@gmail.com">weststurhan@gmail.com</a>.</p>
    </main>
  );
}
