import { NextResponse } from "next/server";
import { getGameCenterSession } from "@code/auth/parentSession";

export const runtime = "nodejs";

export async function GET() {
  const session = await getGameCenterSession();
  if (!session) return NextResponse.json({ message: "Barangay Platform sign-in is required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ user: session.user, role: session.gameCenterRole }, { headers: { "Cache-Control": "no-store" } });
}