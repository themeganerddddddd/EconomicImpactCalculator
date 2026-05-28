import type { Metadata } from "next";
import MethodologyExplainer from "@/components/MethodologyExplainer";

export const metadata: Metadata = {
  title: "Methodology | EconomicImpactCalculator",
  description: "EconomicImpactCalculator methodology for input-output impacts, Leontief inverse, regionalization, leakage, fiscal effects, and uncertainty ranges."
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Methodology</h1>
      <div className="mt-6"><MethodologyExplainer /></div>
    </main>
  );
}
