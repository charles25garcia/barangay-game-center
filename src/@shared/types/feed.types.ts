import { AuthorRole, FeedPostType } from "@shared/enums";

export interface FeedPost {
  id: string;
  type: FeedPostType;
  authorName: string;
  authorRole: AuthorRole;
  authorAvatarEmoji: string;
  content: string;
  createdAt: string;
}

export interface FeedPostInput {
  type: FeedPostType;
  authorRole: AuthorRole;
  content: string;
}
