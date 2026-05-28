import { DEFAULT_ASSUMPTIONS, DEFAULT_TAX_ASSUMPTIONS } from "../constants/defaults";
import type { Geography, ImpactAssumptions, ImpactBreakdown, ImpactResult, Industry, RegionalMultiplier, UserInputs } from "./types";
import { estimateFiscalImpact } from "./fiscal";
import { calculateDisposableLocalIncome, calculateInducedOutput } from "./induced";
import { runMonteCarlo } from "./uncertainty";
import { cleanNumber } from "./validation";

function breakdown(output: number, jobs: number, laborIncome: number, valueAdded: number): ImpactBreakdown {
  return {
    output: cleanNumber(output),
    jobs: cleanNumber(jobs),
    laborIncome: cleanNumber(laborIncome),
    valueAdded: cleanNumber(valueAdded)
  };
}

export function calculateImpact(input: UserInputs, geography: Geography, industry: Industry, multiplier: RegionalMultiplier): ImpactResult {
  const averageWage = input.averageWage && input.averageWage > 0 ? input.averageWage : multiplier.averageWage || industry.averageWage;
  const averageWageSource = input.averageWage && input.averageWage > 0 ? "User input" : multiplier.averageWage ? "QCEW/regional multiplier average wage fallback" : "Industry seed average wage";
  const directLaborIncome = input.directJobs * averageWage;
  const constructionOutput = input.constructionSpending ?? 0;
  const estimatedOutputFromJobs = multiplier.laborIncomeRatio > 0 ? directLaborIncome / multiplier.laborIncomeRatio : directLaborIncome / industry.laborIncomeRatio;
  const directOutput = (input.directOutput && input.directOutput > 0 ? input.directOutput : estimatedOutputFromJobs) + constructionOutput;
  const directOutputSource = input.directOutput && input.directOutput > 0 ? "User direct output plus construction spending where entered" : "Estimated from jobs, wage, and labor-income ratio plus construction spending";
  const directJobs = input.directJobs + (constructionOutput > 0 ? constructionOutput / 1_000_000 * multiplier.jobsPerMillionOutput : 0);
  const directValueAdded = directOutput * multiplier.valueAddedRatio;
  const direct = breakdown(directOutput, directJobs, directLaborIncome, directValueAdded);

  const localSupplierSpending = directOutput * input.localPurchaseShare * multiplier.regionalPurchaseCoefficient;
  const indirectOutput = localSupplierSpending * multiplier.indirectOutputMultiplier;
  const indirect = breakdown(
    indirectOutput,
    (indirectOutput / 1_000_000) * multiplier.jobsPerMillionOutput,
    indirectOutput * multiplier.laborIncomeRatio,
    indirectOutput * multiplier.valueAddedRatio
  );

  const disposableLocalIncome = calculateDisposableLocalIncome(directLaborIncome, input.commutingLeakage, input.taxRate, input.savingsRate);
  const inducedOutput = calculateInducedOutput(disposableLocalIncome, multiplier.inducedSpendingMultiplier);
  const induced = breakdown(
    inducedOutput,
    (inducedOutput / 1_000_000) * multiplier.jobsPerMillionOutput,
    inducedOutput * multiplier.laborIncomeRatio,
    inducedOutput * multiplier.valueAddedRatio
  );

  const grossTotal = breakdown(
    direct.output + indirect.output + induced.output,
    direct.jobs + indirect.jobs + induced.jobs,
    direct.laborIncome + indirect.laborIncome + induced.laborIncome,
    direct.valueAdded + indirect.valueAdded + induced.valueAdded
  );
  const netTotal = breakdown(
    grossTotal.output * input.netNewShare,
    grossTotal.jobs * input.netNewShare,
    grossTotal.laborIncome * input.netNewShare,
    grossTotal.valueAdded * input.netNewShare
  );
  const leakageAmount = grossTotal.output - netTotal.output;
  const fiscalImpact = estimateFiscalImpact({
    mode: input.fiscalEstimateMode,
    netLaborIncome: netTotal.laborIncome,
    disposableLocalIncome,
    netValueAdded: netTotal.valueAdded,
    propertyValueAdded: input.propertyValueAdded,
    custom: {
      incomeTaxRate: input.incomeTaxRate,
      salesTaxRate: input.salesTaxRate,
      propertyTaxRate: input.propertyTaxRate,
      businessTaxRate: input.businessTaxRate,
      taxableSpendingShare: input.taxableSpendingShare
    }
  });
  const assumptions: ImpactAssumptions = {
    ...DEFAULT_TAX_ASSUMPTIONS,
    averageWage,
    averageWageSource,
    directOutput,
    directOutputSource,
    localPurchaseShare: input.localPurchaseShare,
    netNewShare: input.netNewShare,
    commutingLeakage: input.commutingLeakage,
    taxRate: input.taxRate,
    savingsRate: input.savingsRate,
    timeHorizonYears: input.timeHorizonYears || DEFAULT_ASSUMPTIONS.timeHorizonYears,
    constructionDurationYears: input.constructionDurationYears || DEFAULT_ASSUMPTIONS.constructionDurationYears,
    incomeTaxRate: input.incomeTaxRate ?? DEFAULT_TAX_ASSUMPTIONS.incomeTaxRate,
    salesTaxRate: input.salesTaxRate ?? DEFAULT_TAX_ASSUMPTIONS.salesTaxRate,
    propertyTaxRate: input.propertyTaxRate ?? DEFAULT_TAX_ASSUMPTIONS.propertyTaxRate,
    businessTaxRate: input.businessTaxRate ?? DEFAULT_TAX_ASSUMPTIONS.businessTaxRate,
    taxableSpendingShare: input.taxableSpendingShare ?? DEFAULT_TAX_ASSUMPTIONS.taxableSpendingShare
  };

  const warnings = multiplier.dataQuality === "seed" ? [{ code: "SEED_DATA", message: "Using fallback seed data because live/cached public data is not available." }] : [];

  const central: ImpactResult = {
    geography,
    industry,
    multiplier,
    assumptions,
    direct,
    indirect,
    induced,
    grossTotal,
    netTotal,
    annualJobsSupported: netTotal.jobs,
    jobYears: netTotal.jobs * input.timeHorizonYears,
    leakageAmount,
    leakageRate: grossTotal.output > 0 ? leakageAmount / grossTotal.output : 0,
    localRetainedImpact: netTotal.output,
    fiscalImpact,
    uncertainty: null,
    warnings,
    sourceNotes: multiplier.sourceNotes
  };

  return {
    ...central,
    uncertainty: input.confidenceMode === "off" ? null : runMonteCarlo(input, geography, industry, multiplier, central, input.confidenceMode === "wide" ? 1400 : 1000)
  };
}
