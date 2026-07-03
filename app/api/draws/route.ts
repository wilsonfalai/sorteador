import { NextResponse } from "next/server";
import { drawParticipant, getDashboardStats, getDrawHistory } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ draws: getDrawHistory() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    includePreviousWinners?: boolean;
  } | null;
  const result = drawParticipant(Boolean(body?.includePreviousWinners));
  const stats = getDashboardStats();

  if (!result.ok) {
    return NextResponse.json({ ...result, stats }, { status: 400 });
  }

  return NextResponse.json({ ...result, stats });
}
