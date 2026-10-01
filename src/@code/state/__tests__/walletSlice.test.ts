import { TransactionType } from "@shared/enums";
import { coinsCredited, coinsDebited, coinsShared, walletReducer } from "@code/state/walletSlice";
import type { WalletState } from "@shared/types";

const baseState: WalletState = {
  balance: 100,
  dailyShareLimit: 50,
  sharedToday: 0,
  lastShareDate: null,
  transactions: [],
};

describe("walletReducer", () => {
  it("credits coins and records a transaction", () => {
    const next = walletReducer(baseState, coinsCredited({ amount: 25, reason: "Bonus" }));

    expect(next.balance).toBe(125);
    expect(next.transactions).toHaveLength(1);
    expect(next.transactions[0]).toMatchObject({
      type: TransactionType.AdministrativeCredit,
      amount: 25,
      reason: "Bonus",
    });
  });

  it("ignores a non-positive credit amount", () => {
    const next = walletReducer(baseState, coinsCredited({ amount: 0, reason: "No-op" }));
    expect(next).toBe(baseState);
  });

  it("debits coins when balance is sufficient", () => {
    const next = walletReducer(
      baseState,
      coinsDebited({ amount: 40, reason: "Played game", relatedGameId: "game-1" })
    );

    expect(next.balance).toBe(60);
    expect(next.transactions[0]).toMatchObject({
      type: TransactionType.GameSpend,
      amount: 40,
      relatedGameId: "game-1",
    });
  });

  it("rejects a debit that exceeds the balance", () => {
    const next = walletReducer(baseState, coinsDebited({ amount: 999, reason: "Too much" }));
    expect(next).toBe(baseState);
    expect(next.balance).toBe(100);
  });

  it("shares coins within the daily limit", () => {
    const next = walletReducer(
      baseState,
      coinsShared({
        amount: 30,
        recipientName: "Maria",
        timestamp: "2026-09-18T10:00:00.000Z",
      })
    );

    expect(next.balance).toBe(70);
    expect(next.sharedToday).toBe(30);
    expect(next.lastShareDate).toBe("2026-09-18T10:00:00.000Z");
    expect(next.transactions[0]).toMatchObject({
      type: TransactionType.ShareSent,
      amount: 30,
      counterpartyName: "Maria",
    });
  });

  it("rejects sharing beyond the remaining daily limit", () => {
    const almostAtLimit: WalletState = {
      ...baseState,
      sharedToday: 45,
      lastShareDate: "2026-09-18T08:00:00.000Z",
    };

    const next = walletReducer(
      almostAtLimit,
      coinsShared({ amount: 10, recipientName: "Maria", timestamp: "2026-09-18T10:00:00.000Z" })
    );

    expect(next).toBe(almostAtLimit);
  });

  it("resets the daily shared total on a new calendar day", () => {
    const yesterday: WalletState = {
      ...baseState,
      sharedToday: 50,
      lastShareDate: "2026-09-17T09:00:00.000Z",
    };

    const next = walletReducer(
      yesterday,
      coinsShared({ amount: 20, recipientName: "Maria", timestamp: "2026-09-18T09:00:00.000Z" })
    );

    expect(next.sharedToday).toBe(20);
    expect(next.balance).toBe(80);
  });
});
