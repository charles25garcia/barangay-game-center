import { NextResponse } from "next/server";
import { revealGameRegistrationCredentials } from "@code/database/sqlite";
import { getGameCenterSession } from "@code/auth/parentSession";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ appKey: string }> }) {
  const session = await getGameCenterSession();
  if (!session) return NextResponse.json({ message: "Parent platform sign-in required." }, { status: 401 });
  if (session.gameCenterRole !== "super-admin") return NextResponse.json({ message: "SuperAdmin role required." }, { status: 403 });
  const { appKey } = await context.params;
  const credentials = revealGameRegistrationCredentials(appKey);
  return credentials
    ? NextResponse.json(credentials, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ message: "Registered app not found." }, { status: 404 });
}