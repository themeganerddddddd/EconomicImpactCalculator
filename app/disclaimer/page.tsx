import type { Metadata } from "next";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Disclaimer | EconomicImpactCalculator",
  description: "Planning estimate disclaimer for EconomicImpactCalculator.",
  alternates: { canonical: absoluteUrl("/disclaimer") },
  openGraph: {
    title: "Economic Impact Calculator Disclaimer",
    description: "Planning estimate disclaimer for EconomicImpactCalculator.",
    type: "website",
    url: absoluteUrl("/disclaimer"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Disclaimer</h1>
      <p className="mt-4 rounded-lg border border-slate-200 bg-white p-5 leading-7 text-slate-700 shadow-sm">This calculator provides planning estimates using public data and transparent assumptions. It is not an official forecast, certified impact study, or substitute for a full professional economic impact analysis. Results depend on user inputs, data availability, model assumptions, and regional economic conditions.</p>
    </main>
  );
}
