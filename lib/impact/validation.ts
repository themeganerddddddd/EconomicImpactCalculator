import type { UserInputs } from "@/lib/impact/types";

export function validateInputs(input: UserInputs): string[] {
  const errors: string[] = [];
  const nonNegative: Array<[keyof UserInputs, string]> = [
    ["directJobs", "Direct jobs"],
    ["averageWage", "Average wage"],
    ["directOutput", "Direct output"],
    ["constructionSpending", "Construction spending"]
  ];

  for (const [key, label] of nonNegative) {
    const value = input[key];
    if (value !== undefined && typeof value === "number" && value < 0) errors.push(`${label} must be >= 0.`);
  }

  const bounded: Array<[keyof UserInputs, string, number, number]> = [
    ["localPurchaseShare", "Local purchase share", 0, 1],
    ["netNewShare", "Net-new share", 0, 1],
    ["commutingLeakage", "Commuting leakage", 0, 1],
    ["taxRate", "Tax rate", 0, 0.6],
    ["savingsRate", "Savings rate", 0, 0.8],
    ["timeHorizonYears", "Time horizon", 1, 30]
  ];

  for (const [key, label, min, max] of bounded) {
    const value = input[key];
    if (typeof value !== "number" || value < min || value > max) errors.push(`${label} must be between ${min} and ${max}.`);
  }

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "number" && (!Number.isFinite(value) || Number.isNaN(value))) {
      errors.push(`${key} must be a finite number.`);
    }
  }

  return errors;
}

export function cleanNumber(value: number): number {
  return Number.isFinite(value) && !Number.isNaN(value) ? value : 0;
}
