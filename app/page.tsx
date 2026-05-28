import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: { absolute: "Free Economic Impact Calculator" },
  description: "A free public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal impacts using transparent, literature-informed assumptions.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Free Economic Impact Calculator",
    description: "A free public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal impacts using transparent, literature-informed assumptions.",
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
};

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Economic Impact Calculator",
    url: absoluteUrl("/"),
    description: "A free public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal impacts using transparent, literature-informed assumptions."
  };
  const sections = [
    ["What this calculator estimates", "Jobs, labor income, output, GDP/value added, fiscal revenue, leakage, local retained impact, and uncertainty ranges."],
    ["Direct, indirect, and induced impacts", "Direct activity is the project itself, indirect activity is supplier demand, and induced activity is household spending from worker income."],
    ["Why leakage matters", "Not every dollar stays local. The calculator applies commuting, supplier, savings, tax, and net-new assumptions transparently."],
    ["Why confidence ranges matter", "Economic impacts are estimates. Monte Carlo ranges show how sensitive results are to uncertain assumptions."],
    ["Public data sources", "Designed around BEA, BLS QCEW, Census CBP, ACS, and inflation data, with clear fallback warnings when seed data is used."],
    ["Built for public analysis", "Useful for economic developers, local governments, journalists, researchers, and business owners who need explainable planning estimates."]
  ];
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">Free, Transparent Economic Impact Calculator</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Estimate local jobs, wages, GDP, output, fiscal impact, and leakage from business expansions, construction projects, and industry growth using public data and transparent formulas.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calculator" className="rounded-md bg-teal-700 px-5 py-3 font-semibold text-white">Open the economic impact calculator</Link>
              <Link href="/methodology" className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold">View the methodology</Link>
              <Link href="/about" className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold">Learn about the calculator</Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="grid gap-3">
              {["Direct output", "Supplier effects", "Household spending", "Leakage adjustment", "Fiscal estimate", "Confidence range"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md bg-white p-3 text-sm shadow-sm"><span>{item}</span><span className="font-semibold text-teal-700">modeled</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, text]) => <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}
      </section>
      <section className="mx-auto max-w-7xl px-4"><div className="rounded-lg bg-slate-950 p-8 text-white"><h2 className="text-2xl font-semibold">Run a transparent estimate in minutes.</h2><p className="mt-2 text-slate-300">Choose a county, industry, jobs, spending, and assumptions. The calculator returns impact ranges and source notes.</p><Link href="/calculator" className="mt-5 inline-flex rounded-md bg-teal-500 px-5 py-3 font-semibold text-slate-950">Open the economic impact calculator</Link></div></section>
    </main>
  );
}
