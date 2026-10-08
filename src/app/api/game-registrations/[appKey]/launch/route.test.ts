/** @jest-environment node */

import { createGameRegistration, findGameRegistration, resetState } from "@code/database/sqlite";
import { signInbetweenPayload } from "@code/database/providerSecurity";
import { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";
import { GET } from "./route";

jest.mock("@code/auth/parentSession", () => ({
  getGameCenterSession: jest.fn().mockResolvedValue({
    user: { id: "player-demo-001", displayName: "Juan Dela Cruz", homeBarangay: "Barangay San Isidro" },
  }),
}));

const registrationInput = {
  appName: "Launch Test App",
  providerName: "Test Provider",
  description: "Signed launch test",
  category: GameCategory.Community,
  costPerPlay: 0,
  launchType: GameLaunchType.ExternalUrl,
  status: GameStatus.Active,
  active: true,
  launchUrl: "https://example.com/game",
  apiBaseUrl: "https://example.com/api",
  authEndpoint: "/auth",
  balanceEndpoint: "/balance",
  addChipsEndpoint: "/add-chips",
  deductChipsEndpoint: "/deduct-chips",
  credentialReference: "local/test",
  signatureAlgorithm: "HMAC-SHA256",
  externalUserIdField: "username",
  transactionIdField: "transId",
  transactionTypeField: "transactionType",
  gameTypeField: "gameType",
  requestIdField: "request_id",
};

beforeEach(() => resetState());
afterEach(() => resetState());

it("creates a signed launch URL with the current platform user", async () => {
  const registration = createGameRegistration(registrationInput);
  const response = await GET(new Request("http://localhost/api/launch"), {
    params: Promise.resolve({ appKey: registration.appKey }),
  });
  const body = await response.json();
  const launchUrl = new URL(body.launchUrl);
  const payload = {
    username: launchUrl.searchParams.get("username"),
    userToken: launchUrl.searchParams.get("userToken"),
    platformName: launchUrl.searchParams.get("platformName"),
    gameType: launchUrl.searchParams.get("gameType"),
  };

  expect(response.status).toBe(200);
  expect(payload.username).toBe("player-demo-001");
  expect(launchUrl.searchParams.get("displayName")).toBe("Juan Dela Cruz");
  expect(body.sign).toBe(signInbetweenPayload(payload, findGameRegistration(registration.appKey)!.signingSecret));
});