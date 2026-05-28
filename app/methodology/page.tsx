import type { Metadata } from "next";
import Link from "next/link";
import MethodologyExplainer from "@/components/MethodologyExplainer";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: { absolute: "Economic Impact Calculator Methodology" },
  description: "Review the input-output framework, assumptions, limitations, and literature-informed methodology behind the economic impact calculator.",
  alternates: { canonical: absoluteUrl("/methodology") },
  openGraph: {
    title: "Economic Impact Calculator Methodology",
    description: "Review the input-output framework, assumptions, limitations, and literature-informed methodology behind the economic impact calculator.",
    type: "article",
    url: absoluteUrl("/methodology"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  }
};

export default function MethodologyPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Economic Impact Calculator Methodology",
    name: "Economic Impact Calculator Methodology",
    description: "Review the input-output framework, assumptions, limitations, and literature-informed methodology behind the economic impact calculator.",
    url: absoluteUrl("/methodology"),
    about: ["input-output analysis", "economic impact analysis", "local purchase share", "leakage", "NAICS"],
    publisher: { "@type": "Organization", name: SITE_NAME }
  };
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <h1 className="text-3xl font-semibold">Methodology</h1>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
        <Link className="text-teal-700" href="/calculator">Open the economic impact calculator</Link>
        <Link className="text-teal-700" href="/about">Learn about the calculator</Link>
      </div>
      <div className="mt-6"><MethodologyExplainer /></div>
    </main>
  );
}
