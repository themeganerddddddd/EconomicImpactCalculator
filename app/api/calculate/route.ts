import { NextResponse } from "next/server";
import { getIndustry } from "@/lib/constants/industries";
import { DEFAULT_ASSUMPTIONS } from "@/lib/constants/defaults";
import { calculateImpact } from "@/lib/impact/model";
import type { UserInputs } from "@/lib/impact/types";
import { validateInputs } from "@/lib/impact/validation";
import { findMultiplier, loadRegionalMultipliers } from "@/lib/data/loaders";
import { findGeography } from "@/lib/data/geographies";
import { buildDynamicCountyMultiplier } from "@/lib/data/dynamicMultipliers";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UserInputs>;
    const geography = await findGeography(String(body.geographyId ?? ""));
    const industry = getIndustry(String(body.industryId ?? ""));
    if (!geography || !industry) {
      return NextResponse.json({ error: "Select a valid geography and industry." }, { status: 400 });
    }

    const input: UserInputs = {
      geographyId: geography.id,
      industryId: industry.id,
      projectType: body.projectType ?? "expansion",
      directJobs: Number(body.directJobs ?? 0),
      averageWage: body.averageWage === undefined || body.averageWage === null ? undefined : Number(body.averageWage),
      directOutput: body.directOutput === undefined || body.directOutput === null ? undefined : Number(body.directOutput),
      constructionSpending: Number(body.constructionSpending ?? 0),
      timeHorizonYears: Number(body.timeHorizonYears ?? DEFAULT_ASSUMPTIONS.timeHorizonYears),
      constructionDurationYears: Number(body.constructionDurationYears ?? DEFAULT_ASSUMPTIONS.constructionDurationYears),
      localPurchaseShare: Number(body.localPurchaseShare ?? geography.defaultLeakageAssumptions?.localPurchaseShare ?? DEFAULT_ASSUMPTIONS.localPurchaseShare),
      netNewShare: Number(body.netNewShare ?? DEFAULT_ASSUMPTIONS.netNewShare),
      commutingLeakage: Number(body.commutingLeakage ?? geography.defaultLeakageAssumptions?.commutingLeakage ?? DEFAULT_ASSUMPTIONS.commutingLeakage),
      taxRate: Number(body.taxRate ?? DEFAULT_ASSUMPTIONS.taxRate),
      savingsRate: Number(body.savingsRate ?? DEFAULT_ASSUMPTIONS.savingsRate),
      confidenceMode: body.confidenceMode ?? "standard",
      fiscalEstimateMode: body.fiscalEstimateMode ?? "simple",
      propertyValueAdded: Number(body.propertyValueAdded ?? 0),
      incomeTaxRate: body.incomeTaxRate === undefined ? undefined : Number(body.incomeTaxRate),
      salesTaxRate: body.salesTaxRate === undefined ? undefined : Number(body.salesTaxRate),
      propertyTaxRate: body.propertyTaxRate === undefined ? undefined : Number(body.propertyTaxRate),
      businessTaxRate: body.businessTaxRate === undefined ? undefined : Number(body.businessTaxRate),
      taxableSpendingShare: body.taxableSpendingShare === undefined ? undefined : Number(body.taxableSpendingShare)
    };

    const errors = validateInputs(input);
    if (errors.length) return NextResponse.json({ errors }, { status: 400 });

    const { multipliers, usedFallback } = await loadRegionalMultipliers();
    let multiplier = findMultiplier(multipliers, geography.id, industry.id) ?? null;
    if (!multiplier) {
      multiplier = await buildDynamicCountyMultiplier(geography, industry.id);
    }
    if (!multiplier) return NextResponse.json({ error: "No multiplier profile found for this selection." }, { status: 404 });

    const result = calculateImpact(input, geography, industry, {
      ...multiplier,
      dataQuality: usedFallback ? "seed" : multiplier.dataQuality
    });
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Calculation failed." }, { status: 500 });
  }
}
