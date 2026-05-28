import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GEOGRAPHIES, getGeography } from "@/lib/constants/geographies";
import SEOCountyIndustryBlock from "@/components/SEOCountyIndustryBlock";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export function generateStaticParams() {
  return GEOGRAPHIES.filter((g) => ["montgomery-county-md", "washington-dc", "fairfax-county-va", "baltimore-city-md", "cook-county-il"].includes(g.slug)).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const geography = getGeography(slug);
  if (!geography) return {};
  return {
    title: `${geography.name} Economic Impact Calculator | EconomicImpactCalculator`,
    description: `Estimate jobs, wages, GDP, output, fiscal impact, and leakage for projects in ${geography.name}.`,
    alternates: { canonical: absoluteUrl(`/geography/${geography.slug}`) },
    openGraph: {
      title: `${geography.name} Economic Impact Calculator`,
      description: `Estimate jobs, wages, GDP, output, fiscal impact, and leakage for projects in ${geography.name}.`,
      type: "website",
      url: absoluteUrl(`/geography/${geography.slug}`),
      siteName: SITE_NAME,
      images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
    }
  };
}

export default async function GeographyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const geography = getGeography(slug);
  if (!geography) notFound();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <SEOCountyIndustryBlock geography={geography} />
    </main>
  );
}
