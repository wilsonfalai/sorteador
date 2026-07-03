import { NextResponse } from "next/server";
import { registerParticipant } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    whatsapp?: string;
  } | null;

  if (!body) {
    return NextResponse.json(
      { message: "Dados invalidos para cadastro." },
      { status: 400 },
    );
  }

  const result = registerParticipant({
    name: body.name ?? "",
    email: body.email ?? "",
    whatsapp: body.whatsapp ?? "",
  });

  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 201 : 400 },
  );
}
