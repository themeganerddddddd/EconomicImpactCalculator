import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EconomicImpactCalculator | Free Economic Impact Calculator",
  description:
    "Estimate local jobs, wages, GDP, output, fiscal impact, and leakage from business expansions, construction projects, and industry growth using transparent public-data methodology."
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
