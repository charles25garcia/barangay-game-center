import type { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";

export interface GameRegistration {
  id: string;
  appKey: string;
  appName: string;
  providerName: string;
  description: string;
  category: GameCategory;
  costPerPlay: number;
  launchType: GameLaunchType;
  status: GameStatus;
  active: boolean;
  launchUrl: string;
  apiBaseUrl: string;
  authEndpoint: string;
  balanceEndpoint: string;
  addChipsEndpoint: string;
  deductChipsEndpoint: string;
  credentialReference: string;
  signatureAlgorithm: string;
  externalUserIdField: string;
  transactionIdField: string;
  transactionTypeField: string;
  gameTypeField: string;
  requestIdField: string;
  createdAt: string;
}

export type GameRegistrationInput = Omit<GameRegistration, "id" | "createdAt" | "appKey">;

export interface ProviderTransaction {
  id: string;
  registrationId: string;
  appKey: string;
  externalUserId: string;
  externalTransactionId: string;
  requestId: string;
  roundId: string;
  direction: "add" | "deduct";
  amount: number;
  transactionType: string;
  gameType: string;
  source: string;
  status: "accepted" | "duplicate";
  signature: string;
  rawPayload: string;
  createdAt: string;
}
