import { MissionStatus } from "@shared/enums";

interface MissionStatusBadgeProps {
  status: MissionStatus;
}

const STATUS_LABELS: Record<MissionStatus, string> = {
  [MissionStatus.Active]: "Active",
  [MissionStatus.Inactive]: "Inactive",
};

const STATUS_CLASSES: Record<MissionStatus, string> = {
  [MissionStatus.Active]: "bg-emerald-600/20 text-emerald-300",
  [MissionStatus.Inactive]: "bg-slate-700/60 text-slate-300",
};

export function MissionStatusBadge({ status }: MissionStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
