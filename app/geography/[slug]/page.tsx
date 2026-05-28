import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GEOGRAPHIES, getGeography } from "@/lib/constants/geographies";
import SEOCountyIndustryBlock from "@/components/SEOCountyIndustryBlock";

export function generateStaticParams() {
  return GEOGRAPHIES.filter((g) => ["montgomery-county-md", "washington-dc", "fairfax-county-va", "baltimore-city-md", "cook-county-il"].includes(g.slug)).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const geography = getGeography(slug);
  if (!geography) return {};
  return {
    title: `${geography.name} Economic Impact Calculator | EconomicImpactCalculator`,
    description: `Estimate jobs, wages, GDP, output, fiscal impact, and leakage for projects in ${geography.name}.`
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
