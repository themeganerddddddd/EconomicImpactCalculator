export const PRODUCTION_SITE_URL = "https://economicimpactcalculator.com";
export const SITE_NAME = "Economic Impact Calculator";
export const OG_IMAGE_PATH = "/browserlogo.png";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!value || value.includes("localhost") || value.includes("127.0.0.1")) {
    return PRODUCTION_SITE_URL;
  }
  return value;
}

export function absoluteUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${cleanPath}`;
}
