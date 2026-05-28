export function calculateDisposableLocalIncome(laborIncome: number, commutingLeakage: number, taxRate: number, savingsRate: number): number {
  const localWorkerIncome = laborIncome * (1 - commutingLeakage);
  return Math.max(0, localWorkerIncome * (1 - taxRate - savingsRate));
}

export function calculateInducedOutput(disposableLocalIncome: number, inducedSpendingMultiplier: number): number {
  return Math.max(0, disposableLocalIncome * inducedSpendingMultiplier);
}
