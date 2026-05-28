"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ImpactResult } from "@/lib/impact/types";
import { formatCurrency } from "@/lib/utils/formatters";

export default function LeakageChart({ result }: { result: ImpactResult }) {
  const data = [
    { name: "Retained local impact", value: result.localRetainedImpact },
    { name: "Leakage / non-net-new", value: result.leakageAmount }
  ];
  return (
    <div className="h-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">Retained Impact vs Leakage</h3>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95}>
            <Cell fill="#0f766e" />
            <Cell fill="#94a3b8" />
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
