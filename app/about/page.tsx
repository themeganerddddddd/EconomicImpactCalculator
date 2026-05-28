import type { Metadata } from "next";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: { absolute: "About the Economic Impact Calculator" },
  description: "Learn about the purpose of the public economic impact calculator and how to request additional information, corrections, or data improvements.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About the Economic Impact Calculator",
    description: "Learn about the purpose of the public economic impact calculator and how to request additional information, corrections, or data improvements.",
    type: "website",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
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
