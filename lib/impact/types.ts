export type DataQuality = "connected" | "cached" | "fallback" | "seed" | "planned";

export interface Geography {
  id: string;
  slug: string;
  name: string;
  type: "county" | "district" | "city" | "state";
  state: string;
  fips: string;
  metro?: string;
  defaultTaxAssumptions?: Partial<TaxAssumptions>;
  defaultLeakageAssumptions?: Partial<Pick<UserInputs, "commutingLeakage" | "localPurchaseShare">>;
}

export interface Industry {
  id: string;
  name: string;
  naics: string[];
  primaryNaics: string;
  naicsTitle: string;
  outputPerWorker: number;
  laborIncomeRatio: number;
  valueAddedRatio: number;
  averageWage: number;
  inducedSpendingMultiplier: number;
  indirectOutputMultiplier: number;
  notes: string;
}

export interface RegionalMultiplier {
  geographyId: string;
  geographyName: string;
  geographyType: string;
  fips: string;
  industryId: string;
  industryName: string;
  naics: string[];
  year: number;
  employment: number;
  wages: number;
  averageWage: number;
  establishments: number;
  estimatedOutput: number;
  estimatedValueAdded: number;
  laborIncomeRatio: number;
  valueAddedRatio: number;
  jobsPerMillionOutput: number;
  locationQuotient: number;
  regionalPurchaseCoefficient: number;
  indirectOutputMultiplier: number;
  inducedSpendingMultiplier: number;
  outputMultiplier: number;
  dataQuality: DataQuality;
  sourceNotes: string[];
}

export type ProjectType = "new-employer" | "expansion" | "construction" | "operations" | "mixed";
export type ConfidenceMode = "off" | "standard" | "wide";
export type FiscalEstimateMode = "none" | "simple" | "custom";

export interface UserInputs {
  geographyId: string;
  industryId: string;
  projectType: ProjectType;
  directJobs: number;
  averageWage?: number;
  directOutput?: number;
  constructionSpending?: number;
  timeHorizonYears: number;
  constructionDurationYears?: number;
  localPurchaseShare: number;
  netNewShare: number;
  commutingLeakage: number;
  taxRate: number;
  savingsRate: number;
  confidenceMode: ConfidenceMode;
  fiscalEstimateMode: FiscalEstimateMode;
  propertyValueAdded?: number;
  incomeTaxRate?: number;
  salesTaxRate?: number;
  propertyTaxRate?: number;
  businessTaxRate?: number;
  taxableSpendingShare?: number;
}

export interface TaxAssumptions {
  incomeTaxRate: number;
  salesTaxRate: number;
  propertyTaxRate: number;
  businessTaxRate: number;
  taxableSpendingShare: number;
}

export interface ImpactAssumptions extends Required<TaxAssumptions> {
  averageWage: number;
  averageWageSource: string;
  directOutput: number;
  directOutputSource: string;
  localPurchaseShare: number;
  netNewShare: number;
  commutingLeakage: number;
  taxRate: number;
  savingsRate: number;
  timeHorizonYears: number;
  constructionDurationYears: number;
}

export interface ImpactBreakdown {
  output: number;
  jobs: number;
  laborIncome: number;
  valueAdded: number;
}

export interface FiscalImpact {
  incomeTax: number;
  salesTax: number;
  propertyTax: number;
  businessTax: number;
  total: number;
}

export interface MonteCarloMetric {
  p10: number;
  p50: number;
  p90: number;
}

export interface MonteCarloResult {
  totalOutput: MonteCarloMetric;
  totalJobs: MonteCarloMetric;
  totalLaborIncome: MonteCarloMetric;
  totalValueAdded: MonteCarloMetric;
  fiscalImpact: MonteCarloMetric;
  leakage: MonteCarloMetric;
}

export interface DataWarning {
  code: string;
  message: string;
}

export interface ImpactResult {
  geography: Geography;
  industry: Industry;
  multiplier: RegionalMultiplier;
  assumptions: ImpactAssumptions;
  direct: ImpactBreakdown;
  indirect: ImpactBreakdown;
  induced: ImpactBreakdown;
  grossTotal: ImpactBreakdown;
  netTotal: ImpactBreakdown;
  annualJobsSupported: number;
  jobYears: number;
  leakageAmount: number;
  leakageRate: number;
  localRetainedImpact: number;
  fiscalImpact: FiscalImpact;
  uncertainty: MonteCarloResult | null;
  warnings: DataWarning[];
  sourceNotes: string[];
}

export interface DataSourceStatus {
  sourceName: string;
  status: DataQuality;
  lastRefreshed?: string;
  notes: string;
}
