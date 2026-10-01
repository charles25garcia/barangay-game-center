import { render, screen } from "@testing-library/react";
import { FeedPostCard } from "@screens/feed/components/FeedPostCard";
import { AuthorRole, FeedPostType } from "@shared/enums";
import type { FeedPost } from "@shared/types";

const post: FeedPost = {
  id: "post-1",
  type: FeedPostType.Achievement,
  authorName: "Maria Santos",
  authorRole: AuthorRole.Player,
  authorAvatarEmoji: "🧑\u200d🎨",
  content: "Unlocked a new achievement!",
  createdAt: "2026-09-18T10:00:00.000Z",
};

describe("FeedPostCard", () => {
  it("renders the author, role, type, and content", () => {
    render(<FeedPostCard post={post} />);

    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Achievement")).toBeInTheDocument();
    expect(screen.getByText("Unlocked a new achievement!")).toBeInTheDocument();
    expect(screen.getByText(/Player/)).toBeInTheDocument();
  });
});
