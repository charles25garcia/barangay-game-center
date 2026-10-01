import { FeedPostType } from "@shared/enums";

interface PostTypeBadgeProps {
  type: FeedPostType;
}

const TYPE_LABELS: Record<FeedPostType, string> = {
  [FeedPostType.Status]: "Status",
  [FeedPostType.Achievement]: "Achievement",
  [FeedPostType.Announcement]: "Announcement",
};

const TYPE_CLASSES: Record<FeedPostType, string> = {
  [FeedPostType.Status]: "bg-slate-700/60 text-slate-200",
  [FeedPostType.Achievement]: "bg-amber-500/20 text-amber-300",
  [FeedPostType.Announcement]: "bg-emerald-600/20 text-emerald-300",
};

export function PostTypeBadge({ type }: PostTypeBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${TYPE_CLASSES[type]}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}
