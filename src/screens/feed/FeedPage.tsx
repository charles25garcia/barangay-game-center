"use client";

import { postCreated, selectPlayerProfile, useAppDispatch, useAppSelector } from "@code/state";
import { AuthorRole, FeedPostType } from "@shared/enums";
import { FeedComposer } from "./components/FeedComposer";
import { FeedList } from "./components/FeedList";

export function FeedPage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectPlayerProfile);

  function handleSubmitPost(input: { content: string }) {
    dispatch(
      postCreated({
        ...input,
        type: FeedPostType.Status,
        authorRole: AuthorRole.Player,
        authorName: profile.displayName,
        authorAvatarEmoji: profile.avatarEmoji,
      })
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h2 className="platform-heading text-xl font-bold">Community Feed</h2>
        <p className="platform-copy text-sm">
          Achievements, announcements, and statuses from every player and admin. Visible to everyone.
        </p>
      </header>

      <FeedComposer onSubmitPost={handleSubmitPost} />
      <FeedList />
    </section>
  );
}
