import type { Metadata } from "next";
import DataSourceStatus from "@/components/DataSourceStatus";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Data Sources | EconomicImpactCalculator",
  description: "Official public data sources used by EconomicImpactCalculator, including BEA, BLS QCEW, Census CBP, ACS, and CPI data.",
  alternates: { canonical: absoluteUrl("/data-sources") },
  openGraph: {
    title: "Economic Impact Calculator Data Sources",
    description: "Official public data sources used by the economic impact calculator, including BEA, BLS QCEW, Census CBP, ACS, and CPI data.",
    type: "website",
    url: absoluteUrl("/data-sources"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
};

export default function DataSourcesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Data Sources</h1>
      <p className="mt-3 text-slate-700">EconomicImpactCalculator is designed around official public datasets and local processed caches. User calculations read processed local files instead of calling public APIs every time.</p>
      <div className="mt-6"><DataSourceStatus /></div>
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 shadow-sm">
        <p>Official sources include BEA Input-Output Accounts, BEA Regional Economic Accounts, BLS QCEW, Census County Business Patterns, ACS, and BLS CPI. Future optional sources may include permits, job postings, business formation statistics, night lights, Google Trends, and real estate data.</p>
      </div>
    </main>
  );
}
