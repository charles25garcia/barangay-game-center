interface CoinBadgeProps {
  amount: number;
  label?: string;
}

export function CoinBadge({ amount, label = "Coins" }: CoinBadgeProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2"
      role="status"
      aria-label={`${label}: ${amount}`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-amber-700">{label}</span>
      <span className="text-lg font-bold text-green-700">🪙 {amount.toLocaleString("en-US")}</span>
    </div>
  );
}
