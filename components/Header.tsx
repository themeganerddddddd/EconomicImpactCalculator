import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">EconomicImpactCalculator</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/calculator">Calculator</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/data-sources">Data Sources</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>
    </header>
  );
}
