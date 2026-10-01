"use client";

import { Card, CoinBadge } from "@shared/components";
import { formatCoins } from "@shared/utils";
import {
  coinsShared,
  selectDailyShareRemaining,
  selectPlayerProfile,
  selectWalletBalance,
  useAppDispatch,
  useAppSelector,
} from "@code/state";
import { ShareCoinsForm } from "./components/ShareCoinsForm";

export function ShareCoinsPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectPlayerProfile);
  const balance = useAppSelector(selectWalletBalance);
  const dailyRemaining = useAppSelector(selectDailyShareRemaining);

  function handleShare(input: { recipientName: string; amount: number; note?: string }) {
    dispatch(
      coinsShared({
        ...input,
        timestamp: new Date().toISOString(),
      })
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-bold text-white">Share coins</h2>
        <p className="text-sm text-slate-400">
          Send coins to another player. Daily sharing remaining: {formatCoins(dailyRemaining)}.
        </p>
      </header>

      <CoinBadge amount={balance} label="Your balance" />

      <Card>
        <ShareCoinsForm
          balance={balance}
          dailyRemaining={dailyRemaining}
          selfName={profile.displayName}
          onShare={handleShare}
        />
      </Card>
    </section>
  );
}
