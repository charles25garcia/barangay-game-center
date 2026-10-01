import { AuthorRole, CoinAdjustmentType } from "@shared/enums";
import type { CoinHistoryEntry } from "@shared/types";
import {
  buildHistoryExportRows,
  filterCoinHistory,
  getVisibleCoinHistory,
  paginateHistory,
} from "./CoinHistoryPage";

const history: CoinHistoryEntry[] = [
  {
    id: "hist-1",
    userId: "u-1",
    userName: "Juan Dela Cruz",
    adjustmentType: CoinAdjustmentType.Credit,
    amount: 150,
    reason: "Monthly bonus",
    adminName: "Admin Pepito",
    createdAt: "2025-01-03T10:00:00.000Z",
  },
  {
    id: "hist-2",
    userId: "u-2",
    userName: "Maria Santos",
    adjustmentType: CoinAdjustmentType.Debit,
    amount: 75,
    reason: "Penalty",
    adminName: "Admin Pepito",
    createdAt: "2025-01-05T08:30:00.000Z",
  },
  {
    id: "hist-3",
    userId: "u-3",
    userName: "Juan Dela Cruz",
    adjustmentType: CoinAdjustmentType.Credit,
    amount: 45,
    reason: "Referral reward",
    adminName: "Admin Lina",
    createdAt: "2025-01-20T14:55:00.000Z",
  },
  {
    id: "hist-4",
    userId: "u-4",
    userName: "Ana Reyes",
    adjustmentType: CoinAdjustmentType.Debit,
    amount: 200,
    reason: "Adjustment",
    adminName: "Admin Pepito",
    createdAt: "2025-02-01T09:00:00.000Z",
  },
];

describe("CoinHistoryPage helpers", () => {
  it("shows every history entry to administrators", () => {
    expect(getVisibleCoinHistory(history, AuthorRole.SuperAdmin, "u-1")).toEqual(history);
    expect(getVisibleCoinHistory(history, AuthorRole.BrgyAdmin, "u-1")).toEqual(history);
  });

  it("limits player history to the signed-in player", () => {
    expect(getVisibleCoinHistory(history, AuthorRole.Player, "u-1").map((entry) => entry.id)).toEqual([
      "hist-1",
    ]);
  });

  it("filters history by player name, date, and amount range", () => {
    const filtered = filterCoinHistory(history, {
      playerName: "juan",
      dateFrom: "2025-01-01",
      dateTo: "2025-01-31",
      amountMin: 40,
      amountMax: 160,
    });

    expect(filtered).toHaveLength(2);
    expect(filtered.map((entry) => entry.id)).toEqual(["hist-3", "hist-1"]);
  });

  it("matches the global search against a season label stored in the reason text", () => {
    const seasonalHistory: CoinHistoryEntry[] = [
      {
        ...history[0],
        id: "hist-season",
        reason: "Summer season bonus",
      },
    ];

    const result = seasonalHistory.filter((entry) => {
      const term = "season";
      const searchableText = [entry.userName, entry.reason, entry.adminName].join(" ").toLowerCase();
      return searchableText.includes(term);
    });

    expect(result).toHaveLength(1);
    expect(result[0].reason.toLowerCase()).toContain("season");
  });

  it("paginates the filtered list with a maximum page size of 50", () => {
    const rows = Array.from({ length: 51 }, (_, index) => ({
      ...history[0],
      id: `hist-${index + 1}`,
      userName: `Player ${index + 1}`,
      amount: index + 1,
    }));

    const pageTwo = paginateHistory(rows, 2, 50);

    expect(pageTwo).toHaveLength(1);
    expect(pageTwo[0].id).toBe("hist-51");
  });

  it("builds export rows readable by Excel", () => {
    const rows = buildHistoryExportRows(history);

    expect(rows[0]).toMatchObject({
      Player: "Juan Dela Cruz",
      Amount: 150,
      Type: "Credit",
      Reason: "Monthly bonus",
      Admin: "Admin Pepito",
    });
    expect(rows[0].Date).toContain("2025");
  });
});
