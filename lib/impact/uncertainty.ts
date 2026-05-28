import type { Geography, ImpactResult, Industry, MonteCarloMetric, MonteCarloResult, RegionalMultiplier, UserInputs } from "./types";

function bounded(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function vary(value: number, pct: number) {
  const swing = (Math.random() * 2 - 1) * pct;
  return value * (1 + swing);
}

function metric(values: number[]): MonteCarloMetric {
  const sorted = [...values].sort((a, b) => a - b);
  const pick = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)))];
  return { p10: pick(0.1), p50: pick(0.5), p90: pick(0.9) };
}

export function runMonteCarlo(input: UserInputs, geography: Geography, industry: Industry, multiplier: RegionalMultiplier, central: ImpactResult, simulations = 1000): MonteCarloResult {
  const totals = { output: [] as number[], jobs: [] as number[], labor: [] as number[], value: [] as number[], fiscal: [] as number[], leakage: [] as number[] };
  for (let i = 0; i < simulations; i += 1) {
    const localPurchaseShare = bounded(vary(input.localPurchaseShare, 0.15), 0, 1);
    const commutingLeakage = bounded(input.commutingLeakage + (Math.random() * 0.2 - 0.1), 0, 1);
    const netNewShare = bounded(vary(input.netNewShare, 0.2), 0, 1);
    const laborIncomeRatio = bounded(vary(multiplier.laborIncomeRatio, 0.1), 0.05, 0.9);
    const valueAddedRatio = bounded(vary(multiplier.valueAddedRatio, 0.1), 0.05, 0.95);
    const jobsPerMillionOutput = Math.max(0.1, vary(multiplier.jobsPerMillionOutput, 0.15));
    const indirectOutputMultiplier = Math.max(0, vary(multiplier.indirectOutputMultiplier, 0.15));
    const inducedSpendingMultiplier = Math.max(0, vary(multiplier.inducedSpendingMultiplier, 0.2));
    const averageWage = Math.max(0, vary(central.assumptions.averageWage, 0.1));
    const directLaborIncome = input.directJobs * averageWage;
    const directOutput = input.directOutput && input.directOutput > 0 ? input.directOutput : directLaborIncome / laborIncomeRatio;
    const directOutputWithConstruction = directOutput + (input.constructionSpending ?? 0);
    const directJobs = input.directJobs + ((input.constructionSpending ?? 0) / 1_000_000) * jobsPerMillionOutput;
    const indirectOutput = directOutputWithConstruction * localPurchaseShare * multiplier.regionalPurchaseCoefficient * indirectOutputMultiplier;
    const inducedOutput = directLaborIncome * (1 - commutingLeakage) * (1 - input.taxRate - input.savingsRate) * inducedSpendingMultiplier;
    const grossOutput = directOutputWithConstruction + indirectOutput + inducedOutput;
    const grossJobs = directJobs + ((indirectOutput + inducedOutput) / 1_000_000) * jobsPerMillionOutput;
    const grossLabor = directLaborIncome + (indirectOutput + inducedOutput) * laborIncomeRatio;
    const grossValue = grossOutput * valueAddedRatio;
    const netOutput = grossOutput * netNewShare;
    const netJobs = grossJobs * netNewShare;
    const netLabor = grossLabor * netNewShare;
    const netValue = grossValue * netNewShare;
    totals.output.push(netOutput);
    totals.jobs.push(netJobs);
    totals.labor.push(netLabor);
    totals.value.push(netValue);
    totals.fiscal.push(central.fiscalImpact.total === 0 ? 0 : netLabor * 0.045 + netValue * 0.012);
    totals.leakage.push(grossOutput - netOutput);
  }
  return {
    totalOutput: metric(totals.output),
    totalJobs: metric(totals.jobs),
    totalLaborIncome: metric(totals.labor),
    totalValueAdded: metric(totals.value),
    fiscalImpact: metric(totals.fiscal),
    leakage: metric(totals.leakage)
  };
}
