import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { findGameRegistration, readState } from "@code/database/sqlite";
import { signInbetweenPayload } from "@code/database/providerSecurity";

export const runtime = "nodejs";

export function GET(request: Request, context: { params: Promise<{ appKey: string }> }) {
  return context.params.then(({ appKey }) => {
    const registrationRecord = findGameRegistration(appKey);
    if (!registrationRecord) return NextResponse.json({ message: "Registered app not found." }, { status: 404 });
    if (!registrationRecord.registration.active || registrationRecord.registration.status !== "active") {
      return NextResponse.json({ message: "Registered app is not active." }, { status: 403 });
    }

    const state = readState();
    const requestedPlayerId = request.headers.get("x-player-id") || state.profile.id;
    const platformUser = state.profile.id === requestedPlayerId
      ? state.profile
      : state.adminUsers.users.find((user) => user.id === requestedPlayerId);
    if (!platformUser) return NextResponse.json({ message: "Player was not found." }, { status: 404 });

    const payload = {
      username: platformUser.id,
      userToken: randomUUID(),
      platformName: "barangay-game-center",
      gameType: registrationRecord.registration.appKey,
    };
    const launchPayload = {
      ...payload,
      displayName: platformUser.displayName,
      avatarEmoji: platformUser.avatarEmoji,
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
  });
}