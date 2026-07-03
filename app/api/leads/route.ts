import { NextResponse } from "next/server";
import { getLeadsPage } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");

  return NextResponse.json(getLeadsPage(page));
}
