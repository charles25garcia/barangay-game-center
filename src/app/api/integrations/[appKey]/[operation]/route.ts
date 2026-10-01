import { NextResponse } from "next/server";
import { createProviderTransaction, findGameRegistration, findProviderTransaction, readState, saveState } from "@code/database/sqlite";
import { isValidSignature, signInbetweenPayload } from "@code/database/providerSecurity";
import { CoinAdjustmentType, TransactionType } from "@shared/enums";
import type { CoinHistoryEntry } from "@shared/types";
import { buildThirdPartyCoinHistoryEntry } from "../../coinHistory";

interface RouteContext {
  params: Promise<{ appKey: string; operation: string }>;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ status: false, data: null, message }, { status });
}

function readContractField(
  payload: Record<string, unknown>,
  configuredField: string,
  aliases: string[] = [],
): string {
  for (const field of [configuredField, ...aliases]) {
    const value = payload[field];
    if (typeof value === "string" || typeof value === "number") return String(value).trim();
  }
  return "";
}

export async function POST(request: Request, context: RouteContext) {
  const { appKey, operation } = await context.params;
  const registrationRecord = findGameRegistration(appKey);
  if (!registrationRecord) return errorResponse("Registered app not found.", 404);
  if (registrationRecord.registration.status !== "active") return errorResponse("Registered app is not active.", 403);

  const body = (await request.json()) as Record<string, unknown>;
  if (
    operation === "auth" &&
    body.secretKey === registrationRecord.signingSecret &&
    typeof body.username === "string" &&
    body.username.trim()
  ) {
    return authenticateApp(
      {
        username: body.username.trim(),
        gameType: typeof body.gameType === "string" && body.gameType.trim()
          ? body.gameType.trim()
          : registrationRecord.registration.appKey,
      },
      registrationRecord,
      "",
    );
  }

  const { sign, ...signedPayload } = body;
  if (typeof sign !== "string" || !isValidSignature(signedPayload, sign, registrationRecord.signingSecret)) {
    return errorResponse("Invalid HMAC-SHA256 signature.", 401);
  }

  if (operation === "auth") return authenticateApp(signedPayload, registrationRecord, sign);
  if (operation === "balance") return readPlayerBalance(signedPayload, registrationRecord, sign);
  if (operation === "add-chips" || operation === "deduct-chips") {
    return recordChipTransaction(operation === "add-chips" ? "add" : "deduct", signedPayload, registrationRecord, sign);
  }
  return errorResponse("Unsupported integration operation.", 404);
}

function readPlayerBalance(
  payload: Record<string, unknown>,
  registrationRecord: ReturnType<typeof findGameRegistration> & object,
  requestSignature: string,
) {
  const { registration } = registrationRecord;
  const externalUserId = readContractField(payload, registration.externalUserIdField, ["externalUserId", "username", "userName"]);
  const gameType = readContractField(payload, registration.gameTypeField, ["gameType"]);
  const state = readState();
  const knownUser = state.profile.id === externalUserId || state.adminUsers.users.some((user) => user.id === externalUserId);
  if (!externalUserId || !gameType) return errorResponse("externalUserId and gameType are required.", 400);
  if (!knownUser) return errorResponse("External user was not found.", 404);

  return signedSuccessResponse({
    appKey: registration.appKey,
    externalUserId,
    gameType,
    balance: state.wallet.balance,
    source: `registered-app:${registration.appKey}`,
  }, registrationRecord.signingSecret, requestSignature);
}

function authenticateApp(
  payload: Record<string, unknown>,
  registrationRecord: ReturnType<typeof findGameRegistration> & object,
  requestSignature: string,
) {
  const { registration } = registrationRecord;
  const externalUserId = readContractField(payload, registration.externalUserIdField, ["externalUserId", "username", "userName"]);
  const gameType = readContractField(payload, registration.gameTypeField, ["gameType"]);
  if (!externalUserId || !gameType) return errorResponse("externalUserId and gameType are required.", 400);

  const state = readState();
  const platformUser = state.profile.id === externalUserId
    ? state.profile
    : state.adminUsers.users.find((user) => user.id === externalUserId);

  const data = {
    appKey: registrationRecord.registration.appKey,
    registrationId: registrationRecord.registration.id,
    externalUserId,
    gameType,
    balance: state.wallet.balance,
    launchUrl: registrationRecord.registration.launchUrl,
    user: platformUser
      ? {
          id: platformUser.id,
          displayName: platformUser.displayName,
          avatarEmoji: platformUser.avatarEmoji,
          homeBarangay: platformUser.homeBarangay,
          role: platformUser.role,
        }
      : {
          id: externalUserId,
          displayName: externalUserId,
          avatarEmoji: "🙂",
          homeBarangay: "",
          role: "player",
        },
  };
  return signedSuccessResponse(data, registrationRecord.signingSecret, requestSignature);
}

function recordChipTransaction(
  direction: "add" | "deduct",
  payload: Record<string, unknown>,
  registrationRecord: ReturnType<typeof findGameRegistration> & object,
  requestSignature: string,
) {
  const { registration } = registrationRecord;
  const state = readState();
  const externalUserId = readContractField(payload, registration.externalUserIdField, ["externalUserId", "username", "userName"]) || state.profile.id;
  const externalTransactionId = readContractField(payload, registration.transactionIdField, ["externalTransactionId", "transId"]);
  const requestId = readContractField(payload, registration.requestIdField, ["requestId", "request_id"]) || externalTransactionId;
  const roundId = readContractField(payload, "roundId", ["round_id"]) || externalTransactionId;
  const gameType = readContractField(payload, registration.gameTypeField, ["gameType"]);
  const transactionType = readContractField(payload, registration.transactionTypeField, ["transactionType"]);
  const amount = Number(payload.amount ?? payload.chips);

  if (!externalTransactionId || !gameType || !transactionType || !Number.isFinite(amount) || amount <= 0) {
    return errorResponse("Transaction ID, game type, transaction type, and a positive amount are required.", 400);
  }

  if (direction === "deduct" && amount > state.wallet.balance
    && !findProviderTransaction(registration.id, externalTransactionId, direction)) {
    return errorResponse("Insufficient platform balance.", 409);
  }

  const result = createProviderTransaction({
    registrationId: registrationRecord.registration.id,
    appKey: registrationRecord.registration.appKey,
    externalUserId,
    externalTransactionId,
    requestId,
    roundId,
    direction,
    amount,
    transactionType,
    gameType,
    source: `registered-app:${registrationRecord.registration.appKey}`,
    signature: requestSignature,
    rawPayload: JSON.stringify(payload),
  });
  if (!result.duplicate) {
    const source = result.transaction.source;
    const appName = registrationRecord.registration.appName || "Third-party app";
    const walletTransactionType = direction === "deduct" ? TransactionType.GameSpend : TransactionType.AdministrativeCredit;
    const walletBalance = direction === "deduct" ? state.wallet.balance - amount : state.wallet.balance + amount;
    const historyEntry = buildThirdPartyCoinHistoryEntry({
      userId: externalUserId,
      userName: resolveExternalUserName(state, externalUserId),
      amount,
      direction,
      transactionType,
      appName,
      createdAt: result.transaction.createdAt,
    });

    saveProviderWalletTransaction(state, {
      id: result.transaction.id,
      type: walletTransactionType,
      amount,
      reason: `${transactionType} from ${source}`,
      createdAt: result.transaction.createdAt,
      source,
    }, walletBalance);
    saveProviderCoinHistory(readState(), historyEntry);
  }
  const data = {
    transactionId: result.transaction.id,
    externalTransactionId,
    appKey: registrationRecord.registration.appKey,
    source: result.transaction.source,
    direction,
    amount,
    balance: readState().wallet.balance,
    status: result.duplicate ? "duplicate" : "accepted",
  };
  return signedSuccessResponse(data, registrationRecord.signingSecret, requestSignature, result.duplicate ? 200 : 201);
}

function resolveExternalUserName(state: ReturnType<typeof readState>, externalUserId: string): string {
  const profileUser = state.profile.id === externalUserId ? state.profile : null;
  if (profileUser?.displayName) return profileUser.displayName;

  const managedUser = state.adminUsers.users.find((user) => user.id === externalUserId);
  return managedUser?.displayName || externalUserId;
}

function saveProviderWalletTransaction(
  state: ReturnType<typeof readState>,
  transaction: { id: string; type: TransactionType; amount: number; reason: string; createdAt: string; source: string },
  balance: number,
) {
  saveState({
    ...state,
    wallet: {
      ...state.wallet,
      balance,
      transactions: [transaction, ...state.wallet.transactions],
    },
  });
}

function saveProviderCoinHistory(state: ReturnType<typeof readState>, entry: CoinHistoryEntry) {
  const updatedUsers = state.adminUsers.users.map((user) => {
    if (user.id !== entry.userId) return user;
    const nextBalance = entry.adjustmentType === CoinAdjustmentType.Credit
      ? user.coinBalance + entry.amount
      : Math.max(0, user.coinBalance - entry.amount);

    return {
      ...user,
      coinBalance: nextBalance,
    };
  });

  saveState({
    ...state,
    adminUsers: {
      ...state.adminUsers,
      history: [entry, ...state.adminUsers.history],
      users: updatedUsers,
    },
  });
}

function signedSuccessResponse(
  data: Record<string, unknown>,
  secret: string,
  requestSignature: string,
  status = 200,
) {
  return NextResponse.json({
    status: true,
    data,
    message: status === 201 ? "Accepted." : "Already accepted.",
    sign: signInbetweenPayload(data, secret),
    requestSign: requestSignature,
  }, { status });
}
