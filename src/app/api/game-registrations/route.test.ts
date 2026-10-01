import { isValidGameRegistrationInput } from "@code/database/gameRegistrationValidation";
import { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";

const validInput = {
  appName: "InBetween Live",
  providerName: "InBetween",
  description: "Live game provider",
  category: GameCategory.Community,
  costPerPlay: 0,
  launchType: GameLaunchType.ExternalUrl,
  status: GameStatus.Active,
  active: true,
  launchUrl: "https://games.example.com/inbetween",
  apiBaseUrl: "https://api.example.com",
  authEndpoint: "/auth",
  balanceEndpoint: "/balance",
  addChipsEndpoint: "/add-chips",
  deductChipsEndpoint: "/deduct-chips",
  credentialReference: "secret-manager/inbetween-live",
  signatureAlgorithm: "HMAC-SHA256",
  externalUserIdField: "username",
  transactionIdField: "transId",
  transactionTypeField: "transactionType",
  gameTypeField: "gameType",
  requestIdField: "request_id",
};

describe("game registration input validation", () => {
  it("accepts a complete provider and transaction contract", () => {
    expect(isValidGameRegistrationInput(validInput)).toBe(true);
  });

  it("rejects missing or blank required fields", () => {
    expect(isValidGameRegistrationInput({ ...validInput, transactionIdField: "" })).toBe(false);
    expect(isValidGameRegistrationInput({ ...validInput, credentialReference: "   " })).toBe(false);
    expect(isValidGameRegistrationInput({ ...validInput, appName: undefined })).toBe(false);
  });

  it("accepts only HMAC-SHA256 signatures", () => {
    expect(isValidGameRegistrationInput({ ...validInput, signatureAlgorithm: "MD5" })).toBe(false);
    expect(isValidGameRegistrationInput(validInput)).toBe(true);
  });
});