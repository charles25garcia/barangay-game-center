/** @jest-environment node */

import { consumeParentLaunch, createCoinPurchase, findCoinPurchaseForPlayer, readParentPlayerState, resetState, saveParentPlayerState, setCoinPurchaseCheckout } from "@code/database/sqlite";
import { findTestCoinPackage } from "@shared/utils";
import { GET } from "./route";

jest.mock("@code/auth/parentSession", () => ({
  getGameCenterSession: jest.fn().mockResolvedValue({ user: { id: "player-demo-001" } }),
}));

describe("PayMongo purchase status reconciliation", () => {
  const originalSecret = process.env.PAYMONGO_SECRET_KEY;
  const originalFetch = global.fetch;
  let purchaseId = "";
  let referenceNumber = "";
  const checkoutSessionId = "cs_test_reconcile";

  beforeEach(() => {
    resetState();
    process.env.PAYMONGO_SECRET_KEY = "sk_test_reconcile";
    const parentUser = { id: "player-demo-001", displayName: "Juan Dela Cruz", homeBarangay: "Barangay San Isidro", barangayId: "brgy-001", role: "resident" as const, isActive: true };
    consumeParentLaunch(parentUser, "purchase-test-launch", "purchase-test-session", Math.floor(Date.now() / 1000) + 60);
    const playerState = readParentPlayerState(parentUser.id)!;
    playerState.wallet.balance = 250;
    playerState.adminUsers.users[0].coinBalance = 250;
    saveParentPlayerState(parentUser.id, playerState);
    const purchase = createCoinPurchase(parentUser.id, findTestCoinPackage("sandbox-10")!);
    purchaseId = purchase.id;
    referenceNumber = purchase.referenceNumber;
    setCoinPurchaseCheckout(purchaseId, checkoutSessionId, "https://checkout.example.test");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.PAYMONGO_SECRET_KEY;
    else process.env.PAYMONGO_SECRET_KEY = originalSecret;
    resetState();
  });

  function checkoutResponse(attributes: Record<string, unknown>) {
    return new Response(JSON.stringify({ data: { id: checkoutSessionId, attributes } }), { status: 200 });
  }

  function request() {
    return GET(new Request(`http://localhost/api/payments/purchases/${purchaseId}`), {
      params: Promise.resolve({ purchaseId }),
    });
  }

  it("credits once after retrieving a verified paid test session", async () => {
    global.fetch = jest.fn().mockResolvedValue(checkoutResponse({
      livemode: false,
      reference_number: referenceNumber,
      payments: [{ id: "pay_test_reconcile", attributes: { status: "paid", amount: 100, currency: "PHP" } }],
    })) as typeof fetch;

    const response = await request();
    const responseBody = await response.json();

    expect(responseBody.status).toBe("paid");
    expect(responseBody.coins).toBe(1);
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(251);
    expect(findCoinPurchaseForPlayer(purchaseId, "player-demo-001")?.status).toBe("paid");
    expect(readParentPlayerState("player-demo-001")!.adminUsers.users[0].coinBalance).toBe(251);
    expect(readParentPlayerState("player-demo-001")!.adminUsers.history[0].userId).toBe("player-demo-001");

    await request();
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(251);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    [{ livemode: true, reference_number: "", payments: [{ id: "pay", attributes: { status: "paid", amount: 100, currency: "PHP" } }] }],
    [{ livemode: false, reference_number: "wrong-reference", payments: [{ id: "pay", attributes: { status: "paid", amount: 100, currency: "PHP" } }] }],
    [{ livemode: false, reference_number: "", payments: [{ id: "pay", attributes: { status: "paid", amount: 999, currency: "PHP" } }] }],
    [{ livemode: false, reference_number: "", payments: [{ id: "pay", attributes: { status: "pending", amount: 100, currency: "PHP" } }] }],
  ])("does not credit a session that fails sandbox/payment validation", async (attributes) => {
    attributes.reference_number = attributes.reference_number === "" ? referenceNumber : attributes.reference_number;
    global.fetch = jest.fn().mockResolvedValue(checkoutResponse(attributes)) as typeof fetch;

    const response = await request();

    expect((await response.json()).status).toBe("pending");
    expect(readParentPlayerState("player-demo-001")!.wallet.balance).toBe(250);
    expect(findCoinPurchaseForPlayer(purchaseId, "player-demo-001")?.status).toBe("pending");
  });
});
