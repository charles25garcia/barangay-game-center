"use client";

import { selectFeedPosts, useAppSelector } from "@code/state";
import { FeedPostCard } from "./FeedPostCard";

export function FeedList() {
  const posts = useAppSelector(selectFeedPosts);

  if (posts.length === 0) {
    return <p className="text-sm text-slate-400">No posts yet. Be the first to share something.</p>;
  }

  return (
    <div className="flex flex-col gap-3" aria-label="Feed posts">
      {posts.map((post) => (
        <FeedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
