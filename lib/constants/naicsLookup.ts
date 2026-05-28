export const NAICS_LOOKUP: Record<string, string> = {
  "221114": "Solar Electric Power Generation",
  "236220": "Commercial and Institutional Building Construction",
  "237130": "Power and Communication Line and Related Structures Construction",
  "325412": "Pharmaceutical Preparation Manufacturing",
  "334413": "Semiconductor and Related Device Manufacturing",
  "335999": "All Other Miscellaneous Electrical Equipment and Component Manufacturing",
  "424700": "Petroleum and Petroleum Products Merchant Wholesalers",
  "445110": "Supermarkets and Other Grocery Retailers",
  "452311": "Warehouse Clubs and Supercenters",
  "481112": "Scheduled Freight Air Transportation",
  "484110": "General Freight Trucking, Local",
  "493110": "General Warehousing and Storage",
  "511210": "Software Publishers",
  "518210": "Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services",
  "522110": "Commercial Banking",
  "524210": "Insurance Agencies and Brokerages",
  "531120": "Lessors of Nonresidential Buildings",
  "541330": "Engineering Services",
  "541511": "Custom Computer Programming Services",
  "541611": "Administrative Management and General Management Consulting Services",
  "541713": "Research and Development in Nanotechnology",
  "541714": "Research and Development in Biotechnology, except Nanobiotechnology",
  "611310": "Colleges, Universities, and Professional Schools",
  "621111": "Offices of Physicians",
  "622110": "General Medical and Surgical Hospitals",
  "721110": "Hotels and Motels",
  "722511": "Full-Service Restaurants",
  "722513": "Limited-Service Restaurants",
  "922110": "Courts",
  "923130": "Administration of Human Resource Programs"
};

export function getNaicsTitle(code: string) {
  return NAICS_LOOKUP[code] ?? "Industry";
}

export function formatIndustryLabel(industry: { name: string; primaryNaics?: string; naics?: string[]; naicsTitle?: string }) {
  const code = industry.primaryNaics ?? industry.naics?.[0] ?? "";
  const title = industry.naicsTitle && industry.naicsTitle !== "Industry" ? industry.naicsTitle : industry.name;
  return code ? `${title} (${code})` : title;
}
