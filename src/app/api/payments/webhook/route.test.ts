/** @jest-environment node */

import { createHmac } from "node:crypto";
import { createCoinPurchase, fulfillCoinPurchase, findCoinPurchase, readState, resetState, setCoinPurchaseCheckout } from "@code/database/sqlite";
import { findTestCoinPackage } from "@shared/utils";
import { POST } from "./route";

const webhookSecret = "test-webhook-secret";

function signedEvent(purchaseReference: string, overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: "evt_test_001",
      type: "event",
      attributes: {
        type: "checkout_session.payment.paid",
        livemode: false,
        data: {
          id: "cs_test_001",
          attributes: {
            reference_number: purchaseReference,
            payments: [{
              id: "pay_test_001",
              attributes: { status: "paid", amount: 100, currency: "PHP" },
            }],
            ...overrides,
          },
        },
      },
    },
  };
}

function webhookRequest(event: unknown, signatureOverride?: string) {
  const rawBody = JSON.stringify(event);
  const signature = signatureOverride ?? createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return new Request("http://localhost:3100/api/payments/webhook", {
    method: "POST",
    headers: { "Paymongo-Signature": signature },
    body: rawBody,
  });
}

describe("PayMongo sandbox webhook", () => {
  const mutableEnvironment = process.env as Record<string, string | undefined>;
  const originalWebhookSecret = process.env.PAYMONGO_TEST_WEBHOOK_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;
  let referenceNumber = "";
  let purchaseId = "";

  beforeEach(() => {
    process.env.PAYMONGO_TEST_WEBHOOK_SECRET = webhookSecret;
    mutableEnvironment.NODE_ENV = "test";
    resetState();
    const purchase = createCoinPurchase("player-demo-001", findTestCoinPackage("sandbox-10")!);
    referenceNumber = purchase.referenceNumber;
    purchaseId = purchase.id;
    setCoinPurchaseCheckout(purchase.id, "cs_test_001", "https://checkout.example.test");
  });

  afterEach(() => {
    if (originalWebhookSecret === undefined) delete process.env.PAYMONGO_TEST_WEBHOOK_SECRET;
    else process.env.PAYMONGO_TEST_WEBHOOK_SECRET = originalWebhookSecret;
    mutableEnvironment.NODE_ENV = originalNodeEnv;
    resetState();
  });

  it("credits the wallet after a verified paid test event exactly once", async () => {
    const event = signedEvent(referenceNumber);
    const first = await POST(webhookRequest(event));
    const retry = await POST(webhookRequest(event));

    expect(first.status).toBe(200);
    expect(retry.status).toBe(200);
    expect((await retry.json()).duplicate).toBe(true);
    expect(readState().wallet.balance).toBe(251);
    expect(readState().wallet.transactions.filter((transaction) => transaction.id === `payment-${purchaseId}`)).toHaveLength(1);
    expect(findCoinPurchase(referenceNumber)?.status).toBe("paid");
  });

  it("accepts the documented Checkout webhook envelope without a top-level event ID", async () => {
    const event = {
      event_type: "send.webhook",
      data: {
        type: "checkout_session.payment.paid",
        resource: "checkout_session",
        livemode: false,
        data: {
          id: "cs_test_001",
          type: "checkout_session",
          attributes: {
            reference_number: referenceNumber,
            payments: [{
              id: "pay_test_001",
              attributes: { status: "paid", amount: 100, currency: "PHP" },
            }],
          },
        },
      },
    };
    const first = await POST(webhookRequest(event));
    const retry = await POST(webhookRequest(event));

    expect(first.status).toBe(200);
    expect((await retry.json()).duplicate).toBe(true);
    expect(readState().wallet.balance).toBe(251);
    expect(findCoinPurchase(referenceNumber)?.status).toBe("paid");
  });

  it("rejects an invalid signature without crediting coins", async () => {
    const response = await POST(webhookRequest(signedEvent(referenceNumber), "0".repeat(64)));

    expect(response.status).toBe(401);
    expect(readState().wallet.balance).toBe(250);
  });

  it("rejects live-mode payment events", async () => {
    const event = signedEvent(referenceNumber);
    event.data.attributes.livemode = true;
    const response = await POST(webhookRequest(event));

    expect(response.status).toBe(400);
    expect(readState().wallet.balance).toBe(250);
  });

  it.each([
    [{ payments: [{ id: "pay_test_001", attributes: { status: "paid", amount: 500, currency: "PHP" } }] }, "amount"],
    [{ payments: [{ id: "pay_test_001", attributes: { status: "paid", amount: 100, currency: "USD" } }] }, "currency"],
  ])("rejects a payment with a mismatched %s", async (overrides) => {
    const response = await POST(webhookRequest(signedEvent(referenceNumber, overrides)));

    expect(response.status).toBe(400);
    expect(readState().wallet.balance).toBe(250);
  });

  it("does not credit an unsigned or unpaid event", async () => {
    const event = signedEvent(referenceNumber, {
      payments: [{ id: "pay_test_001", attributes: { status: "pending", amount: 100, currency: "PHP" } }],
    });
    const response = await POST(webhookRequest(event));

    expect(response.status).toBe(400);
    expect(readState().wallet.balance).toBe(250);
  });
});