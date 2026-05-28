import type { Geography } from "../impact/types";

export const GEOGRAPHIES: Geography[] = [
  { id: "montgomery-county-md", slug: "montgomery-county-md", name: "Montgomery County, MD", type: "county", state: "MD", fips: "24031", metro: "Washington-Arlington-Alexandria", defaultLeakageAssumptions: { commutingLeakage: 0.32, localPurchaseShare: 0.62 } },
  { id: "washington-dc", slug: "washington-dc", name: "Washington, DC", type: "district", state: "DC", fips: "11001", metro: "Washington-Arlington-Alexandria", defaultLeakageAssumptions: { commutingLeakage: 0.44, localPurchaseShare: 0.68 } },
  { id: "fairfax-county-va", slug: "fairfax-county-va", name: "Fairfax County, VA", type: "county", state: "VA", fips: "51059", metro: "Washington-Arlington-Alexandria", defaultLeakageAssumptions: { commutingLeakage: 0.30, localPurchaseShare: 0.64 } },
  { id: "prince-georges-county-md", slug: "prince-georges-county-md", name: "Prince George's County, MD", type: "county", state: "MD", fips: "24033", metro: "Washington-Arlington-Alexandria", defaultLeakageAssumptions: { commutingLeakage: 0.38, localPurchaseShare: 0.58 } },
  { id: "baltimore-city-md", slug: "baltimore-city-md", name: "Baltimore City, MD", type: "city", state: "MD", fips: "24510", metro: "Baltimore-Columbia-Towson", defaultLeakageAssumptions: { commutingLeakage: 0.29, localPurchaseShare: 0.60 } },
  { id: "new-york-county-ny", slug: "new-york-county-ny", name: "New York County, NY", type: "county", state: "NY", fips: "36061", metro: "New York-Newark-Jersey City", defaultLeakageAssumptions: { commutingLeakage: 0.52, localPurchaseShare: 0.74 } },
  { id: "los-angeles-county-ca", slug: "los-angeles-county-ca", name: "Los Angeles County, CA", type: "county", state: "CA", fips: "06037", metro: "Los Angeles-Long Beach-Anaheim", defaultLeakageAssumptions: { commutingLeakage: 0.24, localPurchaseShare: 0.72 } },
  { id: "cook-county-il", slug: "cook-county-il", name: "Cook County, IL", type: "county", state: "IL", fips: "17031", metro: "Chicago-Naperville-Elgin", defaultLeakageAssumptions: { commutingLeakage: 0.34, localPurchaseShare: 0.69 } },
  { id: "harris-county-tx", slug: "harris-county-tx", name: "Harris County, TX", type: "county", state: "TX", fips: "48201", metro: "Houston-The Woodlands-Sugar Land", defaultLeakageAssumptions: { commutingLeakage: 0.22, localPurchaseShare: 0.70 } },
  { id: "miami-dade-county-fl", slug: "miami-dade-county-fl", name: "Miami-Dade County, FL", type: "county", state: "FL", fips: "12086", metro: "Miami-Fort Lauderdale-West Palm Beach", defaultLeakageAssumptions: { commutingLeakage: 0.20, localPurchaseShare: 0.66 } }
];

export const getGeography = (idOrSlug: string) =>
  GEOGRAPHIES.find((geography) => geography.id === idOrSlug || geography.slug === idOrSlug);
