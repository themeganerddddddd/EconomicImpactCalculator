import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>Transparent public-data economic impact estimates.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/methodology">Methodology</Link>
          <Link href="/data-sources">Data Sources</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </footer>
  );
}
