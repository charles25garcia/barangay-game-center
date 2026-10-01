import type { StreakMilestone } from "@shared/types";

interface StreakBarProps {
  currentStreak: number;
  milestones: StreakMilestone[];
  claimedMilestoneDays: number[];
}

export function StreakBar({ currentStreak, milestones, claimedMilestoneDays }: StreakBarProps) {
  const maxDays = milestones[milestones.length - 1]?.days ?? 30;
  const progressPercent = Math.min(100, (currentStreak / maxDays) * 100);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-white">Play streak: {currentStreak} day(s)</p>
        <p className="text-xs text-slate-400">Play any game every day to keep your streak alive.</p>
      </div>

      <div className="relative h-3 w-full rounded-full bg-slate-800" role="progressbar" aria-valuenow={currentStreak} aria-valuemin={0} aria-valuemax={maxDays}>
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />

        {milestones.map((milestone) => (
          <span
            key={milestone.days}
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-slate-950"
            style={{
              left: `${(milestone.days / maxDays) * 100}%`,
              backgroundColor: claimedMilestoneDays.includes(milestone.days) ? "#34d399" : "#475569",
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        {milestones.map((milestone) => (
          <span key={milestone.days} className={claimedMilestoneDays.includes(milestone.days) ? "text-emerald-300" : ""}>
            {milestone.days}d ({milestone.bonusCoins} coins){claimedMilestoneDays.includes(milestone.days) ? " ✓" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
