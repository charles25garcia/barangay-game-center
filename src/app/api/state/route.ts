import { NextResponse } from "next/server";
import { readState, resetState, saveState } from "@code/database/sqlite";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(readState());
}

export async function PUT(request: Request) {
  saveState(await request.json());
  return NextResponse.json({ ok: true });
}

export function DELETE() {
  return NextResponse.json(resetState());
}