import { Avatar, Card } from "@shared/components";
import type { FeedPost } from "@shared/types";
import { ROLE_LABELS } from "@shared/utils";
import { PostTypeBadge } from "./PostTypeBadge";

interface FeedPostCardProps {
  post: FeedPost;
}

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <Card className="flex flex-col gap-2" aria-label={`Post by ${post.authorName}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar emoji={post.authorAvatarEmoji} name={post.authorName} size="sm" />
          <div>
            <p className="font-semibold text-[var(--navy)]">{post.authorName}</p>
            <p className="text-xs text-[var(--muted)]">
              {ROLE_LABELS[post.authorRole]} · {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </div>
        <PostTypeBadge type={post.type} />
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-[#4f5d57]">{post.content}</p>
    </Card>
  );
}
