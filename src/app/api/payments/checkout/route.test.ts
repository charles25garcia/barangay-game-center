/** @jest-environment node */

import { resetState } from "@code/database/sqlite";
import { POST } from "./route";

jest.mock("@code/auth/parentSession", () => ({
  getGameCenterSession: jest.fn().mockResolvedValue({ user: { id: "parent-player-001" } }),
}));

describe("PayMongo test checkout", () => {
  const originalSecret = process.env.PAYMONGO_SECRET_KEY;
  const originalWebhookSecret = process.env.PAYMONGO_TEST_WEBHOOK_SECRET;
  const originalBaseUrl = process.env.GAME_CENTER_BASE_URL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetState();
    process.env.PAYMONGO_SECRET_KEY = "sk_test_checkout-secret";
    process.env.PAYMONGO_TEST_WEBHOOK_SECRET = "test-webhook-secret";
    process.env.GAME_CENTER_BASE_URL = "http://localhost:3100";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.PAYMONGO_SECRET_KEY;
    else process.env.PAYMONGO_SECRET_KEY = originalSecret;
    if (originalWebhookSecret === undefined) delete process.env.PAYMONGO_TEST_WEBHOOK_SECRET;
    else process.env.PAYMONGO_TEST_WEBHOOK_SECRET = originalWebhookSecret;
    if (originalBaseUrl === undefined) delete process.env.GAME_CENTER_BASE_URL;
    else process.env.GAME_CENTER_BASE_URL = originalBaseUrl;
    resetState();
  });

  it("uses the server package price and returns only the hosted checkout URL", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { id: "cs_test_001", attributes: { checkout_url: "https://checkout.paymongo.test/session" } },
    }), { status: 201 })) as typeof fetch;

    const response = await POST(new Request("http://localhost:3100/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId: "sandbox-10", amountMinor: 1, coins: 999999 }),
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ checkoutUrl: "https://checkout.paymongo.test/session" });
    const [url, request] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.paymongo.com/v2/checkout_sessions");
    expect(request.headers).toMatchObject({ "Idempotency-Key": expect.stringMatching(/^GC-/) });
    const payload = JSON.parse(String(request.body));
    expect(payload.data.attributes.line_items[0]).toMatchObject({ amount: 100, currency: "PHP", quantity: 1 });
    expect(payload.data.attributes.payment_method_types).toEqual(["gcash"]);
  });

  it("rejects an unknown package without calling PayMongo", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    const response = await POST(new Request("http://localhost:3100/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ packageId: "custom-price" }),
    }));

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not call PayMongo without a test key", async () => {
    process.env.PAYMONGO_SECRET_KEY = "sk_live_not-allowed";
    global.fetch = jest.fn() as unknown as typeof fetch;
    const response = await POST(new Request("http://localhost:3100/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ packageId: "sandbox-10" }),
    }));

    expect(response.status).toBe(503);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});