"use client";

import { useEffect, useState } from "react";
import { useAppSelector, selectWalletBalance } from "@code/state";
import { Card, CoinBadge } from "@shared/components";
import type { CoinPurchaseStatusResponse } from "@shared/types";
import { TEST_COIN_PACKAGES } from "@shared/utils";

interface PurchaseConfiguration {
  enabled: boolean;
  mode: "test";
}

export function TopUpPage() {
  const balance = useAppSelector(selectWalletBalance);
  const [configuration, setConfiguration] = useState<PurchaseConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<CoinPurchaseStatusResponse | null>(null);
  const [returnResult, setReturnResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments/checkout")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check sandbox availability.");
        setConfiguration((await response.json()) as PurchaseConfiguration);
      })
      .catch(() => setConfiguration({ enabled: false, mode: "test" }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchaseId = params.get("purchaseId");
    const result = params.get("result");
    setReturnResult(result);
    if (!purchaseId || result === "paid" || result === "cancelled") return;

    let cancelled = false;
    let interval: number;
    const checkPurchase = async () => {
      try {
        const response = await fetch(`/api/payments/purchases/${encodeURIComponent(purchaseId)}`);
        if (!response.ok) return;
        const purchase = (await response.json()) as CoinPurchaseStatusResponse;
        if (cancelled) return;
        setPurchaseState(purchase);
        if (purchase.status === "paid") {
          window.location.replace(`/wallet/top-up?purchaseId=${encodeURIComponent(purchaseId)}&result=paid`);
        } else if (purchase.status === "failed") {
          window.clearInterval(interval);
        }
      } catch {
        // Keep polling; a temporary status request failure does not change payment state.
      }
    };

    void checkPurchase();
    interval = window.setInterval(() => void checkPurchase(), 2500);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 120000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  async function startCheckout(packageId: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const body = (await response.json()) as { checkoutUrl?: string; message?: string };
      if (!response.ok || !body.checkoutUrl) {
        setError(body.message || "Could not start sandbox checkout.");
        return;
      }
      window.location.assign(body.checkoutUrl);
    } catch {
      setError("PayMongo sandbox is temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  }

  const sandboxEnabled = configuration?.enabled === true;

  return (
    <section className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Wallet</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--navy)]">Buy coins</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Sandbox purchases use PayMongo test mode only. No real money is charged.</p>
      </header>

      <CoinBadge amount={balance} label="Your balance" />

      {returnResult === "paid" ? (
        <Card><p role="status" className="text-sm font-semibold text-emerald-700">Sandbox payment confirmed. Your coin balance has been updated.</p></Card>
      ) : null}
      {returnResult === "cancelled" && purchaseState?.status !== "paid" ? (
        <Card><p role="status" className="text-sm text-[var(--muted)]">Checkout was closed. The purchase remains unconfirmed; coins are added only after PayMongo test confirmation.</p></Card>
      ) : null}
      {purchaseState?.status === "pending" ? (
        <Card><p role="status" className="text-sm text-[var(--muted)]">Waiting for PayMongo test confirmation. Coins are added after the signed webhook arrives.</p></Card>
      ) : null}
      {purchaseState?.status === "failed" ? (
        <Card><p role="status" className="text-sm text-[var(--coral)]">This sandbox checkout did not complete. No coins were added.</p></Card>
      ) : null}

      {!configuration ? <Card><p role="status" className="text-sm text-[var(--muted)]">Checking sandbox availability...</p></Card> : null}
      {configuration && !sandboxEnabled ? (
        <Card><p className="text-sm text-[var(--muted)]">PayMongo test keys and a test webhook secret are required to enable checkout.</p></Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TEST_COIN_PACKAGES.map((coinPackage) => (
          <Card key={coinPackage.id} className="flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-[var(--navy)]">{coinPackage.name}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{coinPackage.coins} demo {coinPackage.coins === 1 ? "coin" : "coins"}</p>
              <p className="mt-3 text-lg font-bold text-[var(--ink)]">₱{(coinPackage.amountMinor / 100).toFixed(2)} <span className="text-xs font-medium text-[var(--muted)]">test charge</span></p>
            </div>
            <button
              type="button"
              disabled={!sandboxEnabled || isLoading || Boolean(purchaseState?.status === "pending")}
              onClick={() => void startCheckout(coinPackage.id)}
              className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Opening checkout..." : "Continue to test checkout"}
            </button>
          </Card>
        ))}
      </div>

      {error ? <p role="alert" className="text-sm font-medium text-[var(--coral)]">{error}</p> : null}
    </section>
  );
}