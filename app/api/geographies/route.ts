import { NextResponse } from "next/server";
import { loadGeographies } from "@/lib/data/geographies";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ geographies: await loadGeographies() });
}
