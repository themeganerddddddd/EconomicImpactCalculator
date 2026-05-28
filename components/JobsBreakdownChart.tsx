"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ImpactResult } from "@/lib/impact/types";
import { formatJobs } from "@/lib/utils/formatters";

export default function JobsBreakdownChart({ result }: { result: ImpactResult }) {
  const data = [
    { name: "Jobs", Direct: result.direct.jobs, Indirect: result.indirect.jobs, Induced: result.induced.jobs }
  ];
  return (
    <div className="h-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-semibold">Jobs Supported</h3>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => formatJobs(Number(v))} />
          <Bar dataKey="Direct" stackId="a" fill="#2563eb" />
          <Bar dataKey="Indirect" stackId="a" fill="#0f766e" />
          <Bar dataKey="Induced" stackId="a" fill="#84cc16" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
