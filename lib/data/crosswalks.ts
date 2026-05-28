import { INDUSTRIES } from "@/lib/constants/industries";

export function industryForNaics(naics: string) {
  return INDUSTRIES.find((industry) => industry.naics.some((prefix) => naics.startsWith(prefix)));
}
