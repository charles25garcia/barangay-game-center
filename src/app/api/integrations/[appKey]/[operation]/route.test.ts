/** @jest-environment node */

import { consumeParentLaunch, createGameRegistration, findGameRegistration, readParentPlayerState, resetState, saveParentPlayerState } from "@code/database/sqlite";
import { signInbetweenPayload } from "@code/database/providerSecurity";
import { POST } from "./route";
import { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";

const registrationInput = {
  appName: "Provider Test App",
  providerName: "Test Provider",
  description: "Signed provider test",
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
  credentialReference: "secret-manager/provider-test",
  signatureAlgorithm: "HMAC-SHA256",
  externalUserIdField: "username",
  transactionIdField: "transId",
  transactionTypeField: "transactionType",
  gameTypeField: "gameType",
  requestIdField: "request_id",
};

let appKey = "";
let secret = "";

function signedBody(body: Record<string, unknown>) {
  return { ...body, sign: signInbetweenPayload(body, secret) };
}

beforeEach(() => {
  resetState();
  consumeParentLaunch({
    id: "player-demo-001",
    displayName: "Juan Dela Cruz",
    homeBarangay: "Barangay San Isidro",
    barangayId: "brgy-001",
    role: "resident",
    isActive: true,
  }, "provider-test-launch", "provider-test-session", Math.floor(Date.now() / 1000) + 60);
  const playerState = readParentPlayerState("player-demo-001")!;
  playerState.wallet.balance = 250;
  playerState.adminUsers.users[0].coinBalance = 250;
  saveParentPlayerState("player-demo-001", playerState);
  const registration = createGameRegistration(registrationInput);
  appKey = registration.appKey;
  secret = findGameRegistration(appKey)?.signingSecret ?? "";
});

afterEach(() => resetState());

describe("registered app integration", () => {
  it.each(["", "{", "null", "[]", '"text"', "42", "true", "username=player-demo-001"])("rejects a non-object or invalid JSON body (%s) without changing the wallet", async (body) => {
    const response = await POST(new Request("http://localhost/api", {
      method: "POST",
      body,
    }), { params: Promise.resolve({ appKey, operation: "auth" }) });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: false,
      data: null,
      message: "Request body must be a valid JSON object.",
    });
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(250);
  });

  it("authenticates a signed app request", async () => {
    const body = signedBody({ username: "player-demo-001", userToken: "provider-token", gameType: "classic" });
    const response = await POST(new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) }), {
      params: Promise.resolve({ appKey, operation: "auth" }),
    });

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.data.externalUserId).toBe("player-demo-001");
    expect(responseBody.data.user.displayName).toBe("Juan Dela Cruz");
  });

  it("records a signed chip transaction once and makes retries duplicate-safe", async () => {
    const body = signedBody({
      username: "player-demo-001",
      chips: 25,
      gameType: "classic",
      transId: "provider-txn-001",
      request_id: "request-001",
      round_id: "round-001",
      transactionType: "CLASSIC_WIN",
    });
    const request = () => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
    const context = { params: Promise.resolve({ appKey, operation: "add-chips" }) };

    const first = await POST(request(), context);
    const duplicate = await POST(request(), context);

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(200);
    const firstBody = await first.json();
    const duplicateBody = await duplicate.json();
    expect(firstBody.data.balance).toBe(275);
    expect(firstBody.sign).toBe(signInbetweenPayload(firstBody.data, secret));
    expect(duplicateBody.data.status).toBe("duplicate");
    expect(duplicateBody.data.balance).toBe(275);
    expect(duplicateBody.sign).toBe(signInbetweenPayload(duplicateBody.data, secret));

    const balanceBody = signedBody({ username: "player-demo-001", gameType: "classic" });
    const balanceResponse = await POST(new Request("http://localhost/api", { method: "POST", body: JSON.stringify(balanceBody) }), {
      params: Promise.resolve({ appKey, operation: "balance" }),
    });
    expect((await balanceResponse.json()).data.balance).toBe(275);
  });

  it("rejects a request when the signature does not match the payload", async () => {
    const body = signedBody({ username: "player-001", gameType: "classic" });
    const response = await POST(new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ ...body, gameType: "changed-after-signing" }),
    }), {
      params: Promise.resolve({ appKey, operation: "auth" }),
    });

    expect(response.status).toBe(401);
  });

  it("uses the registered field contract for deduct requests and preserves provenance", async () => {
    const body = signedBody({
      username: "player-demo-001",
      chips: 10,
      gameType: "classic",
      transId: "provider-deduct-001",
      request_id: "request-deduct-001",
      round_id: "round-deduct-001",
      transactionType: "CLASSIC_BET",
    });
    const response = await POST(new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) }), {
      params: Promise.resolve({ appKey, operation: "deduct-chips" }),
    });

    expect(response.status).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.data.direction).toBe("deduct");
    expect(responseBody.data.source).toBe(`registered-app:${appKey}`);
    expect(responseBody.data.balance).toBe(240);
    expect(responseBody.sign).toBe(signInbetweenPayload(responseBody.data, secret));
  });

  it("deducts a signed InBetween request without request or round IDs only once", async () => {
    const body = signedBody({
      userName: "player-demo-001",
      chips: 50,
      gameType: "rush",
      transId: "rush-txn-001-RUSH",
      transactionType: "rushCallBets",
    });
    const request = () => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
    const context = { params: Promise.resolve({ appKey, operation: "deduct-chips" }) };

    const first = await POST(request(), context);
    const retry = await POST(request(), context);

    expect(first.status).toBe(201);
    expect(retry.status).toBe(200);
    expect((await retry.json()).data).toMatchObject({ status: "duplicate", balance: 200 });
    const playerState = readParentPlayerState("player-demo-001")!;
    expect(playerState.wallet.balance).toBe(200);
    expect(playerState.wallet.transactions.filter((transaction) => transaction.source === `registered-app:${appKey}`)).toHaveLength(1);
  });

  it("returns the current zero balance when retrying an exhausted-wallet deduct", async () => {
    const playerState = readParentPlayerState("player-demo-001")!;
    playerState.wallet.balance = 250;
    saveParentPlayerState("player-demo-001", playerState);
    const body = signedBody({ username: "player-demo-001", amount: 250, gameType: "rush", transId: "empty-wallet-001", transactionType: "rushCallBets" });
    const request = () => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
    const context = { params: Promise.resolve({ appKey, operation: "deduct-chips" }) };

    const first = await POST(request(), context);
    const retry = await POST(request(), context);

    expect(first.status).toBe(201);
    expect((await first.json()).data.balance).toBe(0);
    expect(retry.status).toBe(200);
    const retryBody = await retry.json();
    expect(retryBody.data).toMatchObject({ status: "duplicate", balance: 0 });
    expect(retryBody.sign).toBe(signInbetweenPayload(retryBody.data, secret));
    expect(readParentPlayerState("player-demo-001")!.wallet.transactions.filter((transaction) => transaction.source === `registered-app:${appKey}`)).toHaveLength(1);
  });

  it("uses the active profile when the four required transaction fields omit a user", async () => {
    const body = signedBody({ chips: 5, gameType: "rush", transId: "rush-win-001", transactionType: "rushWin" });
    const response = await POST(new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) }), {
      params: Promise.resolve({ appKey, operation: "add-chips" }),
    });

    expect(response.status).toBe(201);
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(255);
    expect(readParentPlayerState("player-demo-001")!.adminUsers.history[0].userId).toBe("player-demo-001");
  });

  it.each([
    [{ chips: 5, gameType: "rush", transactionType: "rushWin" }, "Transaction ID"],
    [{ chips: 5, transId: "missing-game", transactionType: "rushWin" }, "game type"],
    [{ chips: 5, transId: "missing-type", gameType: "rush" }, "transaction type"],
    [{ chips: 0, transId: "zero-amount", gameType: "rush", transactionType: "rushWin" }, "positive amount"],
  ])("rejects an incomplete transaction (%s)", async (payload, field) => {
    const response = await POST(new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(signedBody(payload)),
    }), { params: Promise.resolve({ appKey, operation: "deduct-chips" }) });

    expect(response.status).toBe(400);
    expect((await response.json()).message).toContain(field);
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(250);
  });

  it("returns the signed balance for a known user", async () => {
    const body = signedBody({ username: "player-demo-001", gameType: "classic" });
    const response = await POST(new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) }), {
      params: Promise.resolve({ appKey, operation: "balance" }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).data.balance).toBe(250);
  });
});
