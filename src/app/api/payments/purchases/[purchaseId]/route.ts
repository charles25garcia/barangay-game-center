import { NextResponse } from "next/server";
import { findCoinPurchaseForPlayer, fulfillCoinPurchase } from "@code/database/sqlite";
import { getPayMongoTestSecret } from "@code/payments/paymongoTestMode";
import { getGameCenterSession } from "@code/auth/parentSession";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ purchaseId: string }> }) {
  const { purchaseId } = await context.params;
  const session = await getGameCenterSession();
  if (!session) return NextResponse.json({ message: "Parent platform sign-in required." }, { status: 401 });
  const playerId = session.user.id;
  let purchase = findCoinPurchaseForPlayer(purchaseId, playerId);
  if (!purchase) return NextResponse.json({ message: "Purchase not found." }, { status: 404 });

  const secret = getPayMongoTestSecret();
  if (purchase.status === "pending" && secret && purchase.checkoutSessionId) {
    try {
      const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${encodeURIComponent(purchase.checkoutSessionId)}`, {
        headers: { Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}` },
      });
      if (response.ok) {
        const result = await response.json() as {
          data?: {
            id?: string;
            attributes?: {
              livemode?: boolean;
              reference_number?: string;
              payments?: Array<{
                id?: string;
                attributes?: { amount?: number; currency?: string; status?: string };
              }>;
            };
          };
        };
        const session = result.data;
        const attributes = session?.attributes;
        const paidPayment = attributes?.payments?.find((payment) => payment.attributes?.status === "paid");
        const paymentAttributes = paidPayment?.attributes;
        if (
          session?.id === purchase.checkoutSessionId &&
          attributes?.livemode === false &&
          attributes.reference_number === purchase.referenceNumber &&
          paidPayment?.id &&
          paymentAttributes?.amount === purchase.amountMinor &&
          paymentAttributes.currency === purchase.currency
        ) {
          fulfillCoinPurchase({
            playerId,
            referenceNumber: purchase.referenceNumber,
            checkoutSessionId: session.id,
            paymentId: paidPayment.id,
            eventId: `reconcile:${session.id}:${paidPayment.id}`,
          });
          purchase = findCoinPurchaseForPlayer(purchaseId, playerId) ?? purchase;
        }
      }
    } catch {
      // The webhook remains the primary path; failed status reconciliation leaves the purchase pending.
    }
  }

  return NextResponse.json({
    id: purchase.id,
    status: purchase.status,
    coins: purchase.coins,
    amountMinor: purchase.amountMinor,
    paidAt: purchase.paidAt,
  });
}