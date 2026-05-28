import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: { absolute: "Economic Impact Calculator" },
  description: "Estimate the potential economic impact of projects, expansions, business activity, and industry investment using adjustable local assumptions.",
  alternates: { canonical: absoluteUrl("/calculator") },
  openGraph: {
    title: "Economic Impact Calculator",
    description: "Estimate the potential economic impact of projects, expansions, business activity, and industry investment using adjustable local assumptions.",
    type: "website",
    url: absoluteUrl("/calculator"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
};

export default function CalculatorPage() {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Economic Impact Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/calculator"),
    description: "A public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal effects using transparent assumptions.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <div className="mb-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">EconomicImpactCalculator</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Economic Impact Calculator</h1>
        <p className="mt-3 max-w-4xl text-slate-700">Enter project, geography, industry, spending, and assumption details. Calculations use local processed data where available, can resolve additional counties from public data, and show source notes with every result.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
          <Link className="text-teal-700" href="/methodology">View the economic impact methodology</Link>
          <Link className="text-teal-700" href="/about">Learn about the calculator</Link>
        </div>
      </div>
      <div className="mt-6"><CalculatorForm /></div>
    </main>
  );
}
