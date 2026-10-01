import { CoinAdjustmentType } from "@shared/enums";
import type { CoinHistoryEntry } from "@shared/types";
import { Card } from "@shared/components";
import { formatCoins } from "@shared/utils";

interface CoinHistoryRowProps {
  entry: CoinHistoryEntry;
}

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function CoinHistoryRow({ entry }: CoinHistoryRowProps) {
  const isCredit = entry.adjustmentType === CoinAdjustmentType.Credit;

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="font-semibold text-black">{entry.userName}</p>
        <p className="text-xs text-slate-500">
          {entry.reason} · by {entry.adminName} · {formatTimestamp(entry.createdAt)}
        </p>
      </div>
      <span className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
        {isCredit ? "+" : "-"}
        {formatCoins(entry.amount)}
      </span>
    </Card>
  );
}
