import { NextResponse } from "next/server";
import { findCoinPurchaseForPlayer, fulfillCoinPurchase, readState, synchronizeDemoProfileManagedBalance } from "@code/database/sqlite";
import { getPayMongoTestSecret } from "@code/payments/paymongoTestMode";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ purchaseId: string }> }) {
  const { purchaseId } = await context.params;
  const playerId = readState().profile.id;
  let purchase = findCoinPurchaseForPlayer(purchaseId, playerId);
  if (!purchase) return NextResponse.json({ message: "Purchase not found." }, { status: 404 });
  synchronizeDemoProfileManagedBalance(playerId);

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