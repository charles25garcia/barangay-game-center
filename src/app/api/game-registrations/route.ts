import { NextResponse } from "next/server";
import { createGameRegistration, listGameRegistrations, revealGameRegistrationCredentials } from "@code/database/sqlite";
import type { GameRegistrationInput } from "@shared/types";
import {
  isValidGameRegistrationInput,
  REQUIRED_GAME_REGISTRATION_FIELDS,
} from "@code/database/gameRegistrationValidation";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(listGameRegistrations());
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (!isValidGameRegistrationInput(body)) {
    return NextResponse.json({ message: "All registration and transaction contract fields are required." }, { status: 400 });
  }

  const input = Object.fromEntries(
    REQUIRED_GAME_REGISTRATION_FIELDS.map((field) => [field, (body[field] as string).trim()]),
  ) as unknown as GameRegistrationInput;
  input.costPerPlay = Number(body.costPerPlay);
  input.category = body.category as GameRegistrationInput["category"];
  input.launchType = body.launchType as GameRegistrationInput["launchType"];
  input.status = body.status as GameRegistrationInput["status"];
  input.active = body.active === true;

  try {
    const registration = createGameRegistration(input);
    return NextResponse.json({ registration, credentials: revealGameRegistrationCredentials(registration.appKey) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ message: "An app with this app key is already registered." }, { status: 409 });
    }
    throw error;
  }
}