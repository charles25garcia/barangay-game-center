import type { GameRegistrationInput } from "@shared/types";

export const REQUIRED_GAME_REGISTRATION_FIELDS: Array<keyof GameRegistrationInput> = [
  "appName",
  "providerName",
  "description",
  "launchUrl",
  "apiBaseUrl",
  "authEndpoint",
  "balanceEndpoint",
  "addChipsEndpoint",
  "deductChipsEndpoint",
  "credentialReference",
  "signatureAlgorithm",
  "externalUserIdField",
  "transactionIdField",
  "transactionTypeField",
  "gameTypeField",
  "requestIdField",
  "category",
  "launchType",
  "status",
];

export const SUPPORTED_SIGNATURE_ALGORITHM = "HMAC-SHA256";

export function isValidGameRegistrationInput(value: unknown): value is GameRegistrationInput {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return REQUIRED_GAME_REGISTRATION_FIELDS.every(
    (field) => typeof input[field] === "string" && input[field].trim().length > 0,
  ) && input.signatureAlgorithm === SUPPORTED_SIGNATURE_ALGORITHM
    && typeof input.costPerPlay === "number"
    && Number.isFinite(input.costPerPlay)
    && input.costPerPlay >= 0
    && typeof input.active === "boolean";
}
