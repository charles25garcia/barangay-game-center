import { NextResponse } from "next/server";
import { GAME_CENTER_SESSION_COOKIE } from "@code/auth/parentSession";

export async function POST(request: Request) {
  const parentOrigin = process.env.BARANGAY_PLATFORM_URL;
  if (!parentOrigin || request.headers.get("origin") !== new URL(parentOrigin).origin) {
    return NextResponse.json({ message: "Invalid sign-out origin." }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/auth/required", request.url), 303);
  response.cookies.set(GAME_CENTER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}