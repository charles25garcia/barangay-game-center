import { CoinAdjustmentType } from "@shared/enums";
import { buildThirdPartyCoinHistoryEntry } from "./coinHistory";

describe("third-party integration coin history", () => {
  it("creates a credit entry for provider add-chip transactions", () => {
    const entry = buildThirdPartyCoinHistoryEntry({
      userId: "player-42",
      userName: "Juan Dela Cruz",
      amount: 50,
      direction: "add",
      transactionType: "reward",
      appName: "Online Fruit Game",
      createdAt: "2025-01-10T00:00:00.000Z",
    });

    expect(entry).toMatchObject({
      userId: "player-42",
      userName: "Juan Dela Cruz",
      amount: 50,
      adjustmentType: CoinAdjustmentType.Credit,
      reason: "reward from Online Fruit Game",
      adminName: "Online Fruit Game",
    });
  });
});
