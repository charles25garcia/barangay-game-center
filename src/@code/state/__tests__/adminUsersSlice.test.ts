import { AuthorRole, CoinAdjustmentType, UserStatus } from "@shared/enums";
import { adminUsersReducer, userCoinsAdjusted, userStatusToggled } from "@code/state/adminUsersSlice";
import type { CoinHistoryEntry, ManagedUser } from "@shared/types";

interface AdminUsersState {
  users: ManagedUser[];
  history: CoinHistoryEntry[];
}

const baseState: AdminUsersState = {
  users: [
    {
      id: "user-a",
      displayName: "Test User",
      avatarEmoji: "🧑",
      homeBarangay: "Barangay Test",
      role: AuthorRole.Player,
      status: UserStatus.Active,
      coinBalance: 100,
    },
  ],
  history: [],
};

describe("adminUsersReducer", () => {
  it("credits coins to a user and records history", () => {
    const next = adminUsersReducer(
      baseState,
      userCoinsAdjusted({
        userId: "user-a",
        type: CoinAdjustmentType.Credit,
        amount: 50,
        reason: "Event bonus",
        adminName: "Super Admin",
      })
    );

    expect(next.users[0].coinBalance).toBe(150);
    expect(next.history).toHaveLength(1);
    expect(next.history[0]).toMatchObject({
      userId: "user-a",
      adjustmentType: CoinAdjustmentType.Credit,
      amount: 50,
      reason: "Event bonus",
      adminName: "Super Admin",
    });
  });

  it("debits coins when the balance is sufficient", () => {
    const next = adminUsersReducer(
      baseState,
      userCoinsAdjusted({
        userId: "user-a",
        type: CoinAdjustmentType.Debit,
        amount: 40,
        reason: "Correction",
        adminName: "Super Admin",
      })
    );

    expect(next.users[0].coinBalance).toBe(60);
    expect(next.history[0].adjustmentType).toBe(CoinAdjustmentType.Debit);
  });

  it("rejects a debit that exceeds the user's balance", () => {
    const next = adminUsersReducer(
      baseState,
      userCoinsAdjusted({
        userId: "user-a",
        type: CoinAdjustmentType.Debit,
        amount: 999,
        reason: "Too much",
        adminName: "Super Admin",
      })
    );

    expect(next).toBe(baseState);
  });

  it("ignores an adjustment for an unknown user", () => {
    const next = adminUsersReducer(
      baseState,
      userCoinsAdjusted({
        userId: "missing-user",
        type: CoinAdjustmentType.Credit,
        amount: 10,
        reason: "N/A",
        adminName: "Super Admin",
      })
    );

    expect(next).toBe(baseState);
  });

  it("toggles a user's status between active and suspended", () => {
    const suspended = adminUsersReducer(baseState, userStatusToggled({ userId: "user-a" }));
    expect(suspended.users[0].status).toBe(UserStatus.Suspended);

    const reactivated = adminUsersReducer(suspended, userStatusToggled({ userId: "user-a" }));
    expect(reactivated.users[0].status).toBe(UserStatus.Active);
  });
});
