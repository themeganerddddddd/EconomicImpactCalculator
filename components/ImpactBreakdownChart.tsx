"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ImpactResult } from "@/lib/impact/types";
import { formatCurrency } from "@/lib/utils/formatters";

export default function ImpactBreakdownChart({ result }: { result: ImpactResult }) {
  const data = [
    { name: "Output", Direct: result.direct.output, Indirect: result.indirect.output, Induced: result.induced.output },
    { name: "Labor income", Direct: result.direct.laborIncome, Indirect: result.indirect.laborIncome, Induced: result.induced.laborIncome },
    { name: "Value added", Direct: result.direct.valueAdded, Indirect: result.indirect.valueAdded, Induced: result.induced.valueAdded }
  ];
  return (
    <div className="h-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">Direct, Indirect, and Induced Dollars</h3>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${Number(v) / 1_000_000}M`} />
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          <Bar dataKey="Direct" stackId="a" fill="#2563eb" />
          <Bar dataKey="Indirect" stackId="a" fill="#0f766e" />
          <Bar dataKey="Induced" stackId="a" fill="#84cc16" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
