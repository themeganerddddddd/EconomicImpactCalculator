import { DEFAULT_TAX_ASSUMPTIONS } from "../constants/defaults";
import type { FiscalEstimateMode, FiscalImpact, TaxAssumptions } from "./types";

export function estimateFiscalImpact(params: {
  mode: FiscalEstimateMode;
  netLaborIncome: number;
  disposableLocalIncome: number;
  netValueAdded: number;
  propertyValueAdded?: number;
  custom?: Partial<TaxAssumptions>;
}): FiscalImpact {
  if (params.mode === "none") return { incomeTax: 0, salesTax: 0, propertyTax: 0, businessTax: 0, total: 0 };
  const rates = { ...DEFAULT_TAX_ASSUMPTIONS, ...(params.mode === "custom" ? params.custom : {}) };
  const incomeTax = params.netLaborIncome * rates.incomeTaxRate;
  const salesTax = params.disposableLocalIncome * rates.taxableSpendingShare * rates.salesTaxRate;
  const propertyTax = (params.propertyValueAdded ?? 0) * rates.propertyTaxRate;
  const businessTax = params.netValueAdded * rates.businessTaxRate;
  return {
    incomeTax,
    salesTax,
    propertyTax,
    businessTax,
    total: incomeTax + salesTax + propertyTax + businessTax
  };
}
