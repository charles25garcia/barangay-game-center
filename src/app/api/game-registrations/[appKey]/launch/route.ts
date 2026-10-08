import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { findGameRegistration } from "@code/database/sqlite";
import { signInbetweenPayload } from "@code/database/providerSecurity";
import { getGameCenterSession } from "@code/auth/parentSession";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ appKey: string }> }) {
  const session = await getGameCenterSession();
  if (!session) return NextResponse.json({ message: "Parent platform sign-in required." }, { status: 401 });
  const { appKey } = await context.params;
    const registrationRecord = findGameRegistration(appKey);
    if (!registrationRecord) return NextResponse.json({ message: "Registered app not found." }, { status: 404 });
    if (!registrationRecord.registration.active || registrationRecord.registration.status !== "active") {
      return NextResponse.json({ message: "Registered app is not active." }, { status: 403 });
    }

    const platformUser = session.user;

    const payload = {
      username: platformUser.id,
      userToken: randomUUID(),
      platformName: "barangay-game-center",
      gameType: registrationRecord.registration.appKey,
    };
    const launchPayload = {
      ...payload,
      displayName: platformUser.displayName,
      avatarEmoji: "🙂",
      homeBarangay: platformUser.homeBarangay,
    };
    const sign = signInbetweenPayload(payload, registrationRecord.signingSecret);
    const launchUrl = new URL(registrationRecord.registration.launchUrl);
    Object.entries({ ...launchPayload, sign }).forEach(([key, value]) => launchUrl.searchParams.set(key, value));

    return NextResponse.json({
      launchUrl: launchUrl.toString(),
      appKey: registrationRecord.registration.appKey,
      payload: launchPayload,
      sign,
    });
}