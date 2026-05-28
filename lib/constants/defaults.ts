import type { TaxAssumptions } from "../impact/types";

export const DEFAULT_TAX_ASSUMPTIONS: TaxAssumptions = {
  incomeTaxRate: 0.045,
  salesTaxRate: 0.055,
  propertyTaxRate: 0.011,
  businessTaxRate: 0.012,
  taxableSpendingShare: 0.42
};

export const DEFAULT_ASSUMPTIONS = {
  localPurchaseShare: 0.6,
  netNewShare: 0.75,
  commutingLeakage: 0.3,
  taxRate: 0.18,
  savingsRate: 0.08,
  timeHorizonYears: 1,
  constructionDurationYears: 1
};
