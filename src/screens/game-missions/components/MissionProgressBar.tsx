interface MissionProgressBarProps {
  current: number;
  target: number;
}

export function MissionProgressBar({ current, target }: MissionProgressBarProps) {
  const percent = Math.min(100, (current / target) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-2 w-full rounded-full bg-[var(--mint)]"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div className="h-full rounded-full bg-[#5eae99] transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-[var(--muted)]">
        {Math.min(current, target).toLocaleString("en-US")} / {target.toLocaleString("en-US")}
      </p>
    </div>
  );
}
