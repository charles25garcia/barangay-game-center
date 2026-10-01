import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CoinAdjustmentType, UserStatus } from "@shared/enums";
import type { CoinHistoryEntry, ManagedUser } from "@shared/types";
import { clampNonNegative, createId } from "@shared/utils";

interface AdminUsersState {
  users: ManagedUser[];
  history: CoinHistoryEntry[];
}

const initialState: AdminUsersState = {
  users: [],
  history: [],
};

interface CoinAdjustedPayload {
  userId: string;
  type: CoinAdjustmentType;
  amount: number;
  reason: string;
  adminName: string;
}

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    userCoinsAdjusted(state, action: PayloadAction<CoinAdjustedPayload>) {
      const { userId, type, reason, adminName } = action.payload;
      const amount = clampNonNegative(action.payload.amount);
      const user = state.users.find((candidate) => candidate.id === userId);
      if (!user || amount === 0) return;

      if (type === CoinAdjustmentType.Debit) {
        if (amount > user.coinBalance) return;
        user.coinBalance -= amount;
      } else {
        user.coinBalance += amount;
      }

      state.history.unshift({
        id: createId("hist"),
        userId: user.id,
        userName: user.displayName,
        adjustmentType: type,
        amount,
        reason,
        adminName,
        createdAt: new Date().toISOString(),
      });
    },
    userStatusToggled(state, action: PayloadAction<{ userId: string }>) {
      const user = state.users.find((candidate) => candidate.id === action.payload.userId);
      if (!user) return;
      user.status = user.status === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active;
    },
    adminUsersReset() {
      return initialState;
    },
  },
});

export const { userCoinsAdjusted, userStatusToggled, adminUsersReset } = adminUsersSlice.actions;
export const adminUsersReducer = adminUsersSlice.reducer;
export const adminUsersInitialState = initialState;
