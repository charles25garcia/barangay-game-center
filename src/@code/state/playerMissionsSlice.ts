import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerMissionsState {
  claimedMissionIds: string[];
}

const initialState: PlayerMissionsState = {
  claimedMissionIds: [],
};

const playerMissionsSlice = createSlice({
  name: "playerMissions",
  initialState,
  reducers: {
    missionClaimed(state, action: PayloadAction<{ missionId: string }>) {
      if (!state.claimedMissionIds.includes(action.payload.missionId)) {
        state.claimedMissionIds.push(action.payload.missionId);
      }
    },
    playerMissionsReset() {
      return initialState;
    },
  },
});

export const { missionClaimed, playerMissionsReset } = playerMissionsSlice.actions;
export const playerMissionsReducer = playerMissionsSlice.reducer;
export const playerMissionsInitialState = initialState;
