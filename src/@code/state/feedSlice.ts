import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthorRole, FeedPostType } from "@shared/enums";
import type { FeedPost } from "@shared/types";
import { createId } from "@shared/utils";
const initialState: FeedPost[] = [];

interface PostCreatedPayload {
  type: FeedPostType;
  authorRole: AuthorRole;
  authorName: string;
  authorAvatarEmoji: string;
  content: string;
}

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    postCreated(state, action: PayloadAction<PostCreatedPayload>) {
      const content = action.payload.content.trim();
      if (!content) return;

      state.unshift({
        id: createId("post"),
        type: action.payload.type,
        authorRole: action.payload.authorRole,
        authorName: action.payload.authorName,
        authorAvatarEmoji: action.payload.authorAvatarEmoji,
        content,
        createdAt: new Date().toISOString(),
      });
    },
    feedReset() {
      return initialState;
    },
  },
});

export const { postCreated, feedReset } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
export const feedInitialState = initialState;
