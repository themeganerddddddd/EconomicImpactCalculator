import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { absoluteUrl, getSiteUrl, OG_IMAGE_PATH, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Free Economic Impact Calculator",
    template: "%s | Economic Impact Calculator"
  },
  description:
    "A free public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal impacts using transparent, literature-informed assumptions.",
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    title: "Free Economic Impact Calculator",
    description:
      "A free public economic impact calculator for estimating jobs, labor income, output, value added, and fiscal impacts using transparent, literature-informed assumptions.",
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(OG_IMAGE_PATH), width: 1200, height: 1200, alt: "Economic Impact Calculator logo" }]
  },
  icons: {
    icon: "/icon.png",
    apple: "/browserlogo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
