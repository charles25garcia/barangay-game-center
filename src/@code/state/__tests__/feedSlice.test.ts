import { AuthorRole, FeedPostType } from "@shared/enums";
import { feedReducer, postCreated } from "@code/state/feedSlice";
import type { FeedPost } from "@shared/types";

const baseState: FeedPost[] = [
  {
    id: "post-existing",
    type: FeedPostType.Status,
    authorName: "Existing Author",
    authorRole: AuthorRole.Player,
    authorAvatarEmoji: "🧑",
    content: "An existing post",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

describe("feedReducer", () => {
  it("adds a new post to the front of the feed", () => {
    const next = feedReducer(
      baseState,
      postCreated({
        type: FeedPostType.Achievement,
        authorRole: AuthorRole.BrgyAdmin,
        authorName: "New Author",
        authorAvatarEmoji: "🧑\u200d💼",
        content: "  I finished the community event!  ",
      })
    );

    expect(next).toHaveLength(2);
    expect(next[0]).toMatchObject({
      type: FeedPostType.Achievement,
      authorRole: AuthorRole.BrgyAdmin,
      authorName: "New Author",
      content: "I finished the community event!",
    });
    expect(next[1]).toBe(baseState[0]);
  });

  it("ignores a post with blank content", () => {
    const next = feedReducer(
      baseState,
      postCreated({
        type: FeedPostType.Status,
        authorRole: AuthorRole.Player,
        authorName: "Someone",
        authorAvatarEmoji: "🧑",
        content: "   ",
      })
    );

    expect(next).toBe(baseState);
  });
});
