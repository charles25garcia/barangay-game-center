import { NextResponse } from "next/server";
import { revealGameRegistrationCredentials } from "@code/database/sqlite";

export const runtime = "nodejs";

export function GET(_request: Request, context: { params: Promise<{ appKey: string }> }) {
  return context.params.then(({ appKey }) => {
    const credentials = revealGameRegistrationCredentials(appKey);
    return credentials
      ? NextResponse.json(credentials)
      : NextResponse.json({ message: "Registered app not found." }, { status: 404 });
  });
}