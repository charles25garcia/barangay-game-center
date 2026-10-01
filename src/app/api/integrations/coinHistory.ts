import { CoinAdjustmentType } from "@shared/enums";
import type { CoinHistoryEntry } from "@shared/types";
import { createId } from "@shared/utils";

export function buildThirdPartyCoinHistoryEntry({
  userId,
  userName,
  amount,
  direction,
  transactionType,
  appName,
  createdAt = new Date().toISOString(),
}: {
  userId: string;
  userName: string;
  amount: number;
  direction: "add" | "deduct";
  transactionType: string;
  appName: string;
  createdAt?: string;
}): CoinHistoryEntry {
  return {
    id: createId("hist"),
    userId,
    userName,
    adjustmentType: direction === "add" ? CoinAdjustmentType.Credit : CoinAdjustmentType.Debit,
    amount,
    reason: `${transactionType} from ${appName}`,
    adminName: appName,
    createdAt,
  };
}
