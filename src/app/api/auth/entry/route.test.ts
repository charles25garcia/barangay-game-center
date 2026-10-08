/** @jest-environment node */

import { createHmac } from "node:crypto";
import { readParentPlayerState, resetState } from "@code/database/sqlite";
import { POST } from "./route";

const secret = "shared-parent-child-sso-secret-for-tests";
const parentUrl = "http://parent.test";
const sessionId = "parent-session-001";
const user = {
  id: "platform-user-001",
  displayName: "Test Resident",
  homeBarangay: "Barangay San Jose",
  barangayId: "brgy-001",
  role: "resident",
  isActive: true,
};

function launchToken(jti = "single-use-launch", origin = parentUrl) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: "barangay-platform",
    aud: "barangay-game-center",
    purpose: "launch",
    sub: user.id,
    sid: sessionId,
    jti,
    origin,
    iat: now,
    exp: now + 60,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function launchRequest(token: string, origin = parentUrl) {
  return new Request("http://game-center.test/api/auth/entry", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  });
}

describe("parent platform Game Center launch exchange", () => {
  const oldSecret = process.env.GAME_CENTER_SSO_SECRET;
  const oldParentUrl = process.env.BARANGAY_PLATFORM_URL;
  const oldNodeEnv = process.env.NODE_ENV;
  const mutableEnv = process.env as Record<string, string | undefined>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    mutableEnv.NODE_ENV = "test";
    process.env.GAME_CENTER_SSO_SECRET = secret;
    process.env.BARANGAY_PLATFORM_URL = parentUrl;
    global.fetch = jest.fn().mockImplementation(async () => new Response(JSON.stringify({ user }), { status: 200 })) as typeof fetch;
    resetState();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (oldSecret === undefined) delete process.env.GAME_CENTER_SSO_SECRET;
    else process.env.GAME_CENTER_SSO_SECRET = oldSecret;
    if (oldParentUrl === undefined) delete process.env.BARANGAY_PLATFORM_URL;
    else process.env.BARANGAY_PLATFORM_URL = oldParentUrl;
    mutableEnv.NODE_ENV = oldNodeEnv;
    resetState();
  });

  it("provisions an isolated player and sets an HttpOnly child session cookie", async () => {
    const response = await POST(launchRequest(launchToken()));
    const playerState = readParentPlayerState(user.id);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://game-center.test/");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(playerState?.profile).toMatchObject({ id: user.id, displayName: user.displayName, homeBarangay: user.homeBarangay });
    expect(playerState?.wallet.balance).toBe(0);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [introspectionUrl, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(String(introspectionUrl)).toBe(`${parentUrl}/api/game-center/introspect`);
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
  });

  it("rejects token replay and does not issue another session", async () => {
    await POST(launchRequest(launchToken()));
    const replay = await POST(launchRequest(launchToken()));

    expect(replay.status).toBe(303);
    expect(replay.headers.get("location")).toContain("reason=replayed");
    expect(replay.headers.get("set-cookie")).toBeNull();
  });

  it("rejects a launch post from an untrusted origin", async () => {
    expect(launchRequest(launchToken("other-nonce"), "https://attacker.test").headers.get("origin")).toBe("https://attacker.test");
    const response = await POST(launchRequest(launchToken("other-nonce"), "https://attacker.test"));

    expect(response.status).toBe(403);
    expect(readParentPlayerState(user.id)).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("accepts the browser-visible parent origin when it is bound into the signed launch token", async () => {
    const browserOrigin = "http://10.60.120.173:3000";
    const response = await POST(launchRequest(launchToken("lan-origin", browserOrigin), browserOrigin));

    expect(response.status).toBe(303);
    expect(readParentPlayerState(user.id)?.profile.id).toBe(user.id);
  });

  it("accepts an opaque browser form origin only with a valid signed parent origin", async () => {
    const response = await POST(launchRequest(launchToken("opaque-origin"), "null"));

    expect(response.status).toBe(303);
    expect(readParentPlayerState(user.id)?.profile.id).toBe(user.id);
  });

  it("rejects an inactive parent user and does not provision a player", async () => {
    global.fetch = jest.fn().mockImplementation(async () => new Response(JSON.stringify({ user: { ...user, isActive: false } }), { status: 200 })) as typeof fetch;
    const response = await POST(launchRequest(launchToken("inactive-nonce")));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("reason=invalid");
    expect(readParentPlayerState(user.id)).toBeNull();
  });
});
