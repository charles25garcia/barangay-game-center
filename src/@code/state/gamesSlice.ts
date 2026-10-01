import { createSlice } from "@reduxjs/toolkit";
import type { Game } from "@shared/types";
const initialState: Game[] = [];

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    catalogReset() {
      return initialState;
    },
  },
});

export const { catalogReset } = gamesSlice.actions;
export const gamesReducer = gamesSlice.reducer;
export const gamesInitialState = initialState;
