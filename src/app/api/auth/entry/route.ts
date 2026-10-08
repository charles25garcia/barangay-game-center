import { NextResponse } from "next/server";
import { consumeParentLaunch } from "@code/database/sqlite";
import { exchangeLaunchToken, GAME_CENTER_SESSION_COOKIE, verifyLaunchToken } from "@code/auth/parentSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let token = "";
  try {
    const formData = await request.formData();
    token = String(formData.get("token") ?? "");
  } catch {
    return NextResponse.redirect(new URL("/auth/required", request.url), 303);
  }

  try {
    const claims = verifyLaunchToken(token);
    const requestOrigin = request.headers.get("origin");
    if (!claims.origin || (requestOrigin !== claims.origin && requestOrigin !== "null")) {
      return NextResponse.json({ message: "Invalid launch origin." }, { status: 403 });
    }
    const exchange = await exchangeLaunchToken(token);
    const consumed = consumeParentLaunch(exchange.user, exchange.launchId, exchange.parentSessionId, exchange.expiresAt);
    if (!consumed) return NextResponse.redirect(new URL("/auth/required?reason=replayed", request.url), 303);

    const response = NextResponse.redirect(new URL("/", request.url), 303);
    response.cookies.set(GAME_CENTER_SESSION_COOKIE, exchange.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/auth/required?reason=invalid", request.url), 303);
  }
}