import { NextResponse } from "next/server";
import { createCoinPurchase, failCoinPurchase, readState, setCoinPurchaseCheckout } from "@code/database/sqlite";
import { getPayMongoTestPaymentMethods, getPayMongoTestSecret } from "@code/payments/paymongoTestMode";
import { findTestCoinPackage } from "@shared/utils";

export const runtime = "nodejs";

function unavailable() {
  return NextResponse.json({ message: "PayMongo sandbox checkout is not configured." }, { status: 503 });
}

export function GET() {
  return NextResponse.json({
    enabled: Boolean(getPayMongoTestSecret() && process.env.PAYMONGO_TEST_WEBHOOK_SECRET),
    mode: "test",
  });
}

export async function POST(request: Request) {
  const secret = getPayMongoTestSecret();
  if (!secret || !process.env.PAYMONGO_TEST_WEBHOOK_SECRET) return unavailable();
  const paymentMethodTypes = getPayMongoTestPaymentMethods();
  if (paymentMethodTypes.length === 0) {
    return NextResponse.json({ message: "Configure at least one supported PayMongo test payment method." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Choose a valid coin package." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || typeof (body as { packageId?: unknown }).packageId !== "string") {
    return NextResponse.json({ message: "Choose a valid coin package." }, { status: 400 });
  }

  const coinPackage = findTestCoinPackage((body as { packageId: string }).packageId);
  if (!coinPackage) return NextResponse.json({ message: "That sandbox package is unavailable." }, { status: 400 });

  const state = readState();
  const purchase = createCoinPurchase(state.profile.id, coinPackage);
  const baseUrl = process.env.GAME_CENTER_BASE_URL || new URL(request.url).origin;
  const successUrl = new URL("/wallet/top-up", baseUrl);
  successUrl.searchParams.set("purchaseId", purchase.id);
  successUrl.searchParams.set("result", "success");
  const cancelUrl = new URL("/wallet/top-up", baseUrl);
  cancelUrl.searchParams.set("purchaseId", purchase.id);
  cancelUrl.searchParams.set("result", "cancelled");

  try {
    const response = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": purchase.referenceNumber,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [{
              name: `${coinPackage.name} (${coinPackage.coins} demo coins)`,
              amount: coinPackage.amountMinor,
              currency: "PHP",
              quantity: 1,
            }],
            payment_method_types: paymentMethodTypes,
            success_url: successUrl.toString(),
            cancel_url: cancelUrl.toString(),
            reference_number: purchase.referenceNumber,
            send_email_receipt: false,
            metadata: { purchase_id: purchase.id, package_id: coinPackage.id },
          },
        },
      }),
    });
    const result = await response.json() as {
      data?: { id?: string; attributes?: { checkout_url?: string } };
    };
    const checkoutSessionId = result.data?.id;
    const checkoutUrl = result.data?.attributes?.checkout_url;
    if (!response.ok || !checkoutSessionId || !checkoutUrl) {
      failCoinPurchase(purchase.id);
      return NextResponse.json({ message: "PayMongo could not start checkout. Please try again." }, { status: 502 });
    }

    setCoinPurchaseCheckout(purchase.id, checkoutSessionId, checkoutUrl);
    return NextResponse.json({ purchaseId: purchase.id, checkoutUrl }, { status: 201 });
  } catch {
    failCoinPurchase(purchase.id);
    return NextResponse.json({ message: "PayMongo sandbox is temporarily unavailable." }, { status: 502 });
  }
}