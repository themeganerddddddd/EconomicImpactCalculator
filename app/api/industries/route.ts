import { NextResponse } from "next/server";
import { INDUSTRIES } from "@/lib/constants/industries";

export async function GET() {
  return NextResponse.json({ industries: INDUSTRIES });
}
