import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthorRole } from "@shared/enums";
import type { Player, ProfileUpdateInput } from "@shared/types";
const initialState: Player = {
  id: "",
  displayName: "",
  avatarEmoji: "👤",
  homeBarangay: "",
  bio: "",
  role: AuthorRole.Player,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    profileUpdated(state, action: PayloadAction<ProfileUpdateInput>) {
      state.displayName = action.payload.displayName.trim() || state.displayName;
      state.avatarEmoji = action.payload.avatarEmoji || state.avatarEmoji;
      state.homeBarangay = action.payload.homeBarangay.trim() || state.homeBarangay;
      state.bio = action.payload.bio.trim();
      state.role = action.payload.role;
    },
    profileReset() {
      return initialState;
    },
  },
});

export const { profileUpdated, profileReset } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
export const profileInitialState = initialState;
