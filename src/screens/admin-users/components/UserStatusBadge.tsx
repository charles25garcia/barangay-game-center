import { UserStatus } from "@shared/enums";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.Active]: "Active",
  [UserStatus.Suspended]: "Suspended",
};

const STATUS_CLASSES: Record<UserStatus, string> = {
  [UserStatus.Active]: "bg-emerald-600/20 text-emerald-300",
  [UserStatus.Suspended]: "bg-rose-600/20 text-rose-300",
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
