"use client";

import { CoinAdjustmentType } from "@shared/enums";
import { RequireRole } from "@code/guards";
import {
  selectManagedUsers,
  selectPlayerProfile,
  useAppDispatch,
  useAppSelector,
  userCoinsAdjusted,
  userStatusToggled,
} from "@code/state";
import { ADMIN_ROLES } from "@shared/utils";
import { UserRow } from "./components/UserRow";

export function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectManagedUsers);
  const admin = useAppSelector(selectPlayerProfile);

  function handleAdjustCoins(
    userId: string,
    input: { type: CoinAdjustmentType; amount: number; reason: string }
  ) {
    dispatch(
      userCoinsAdjusted({
        userId,
        ...input,
        adminName: admin.displayName,
      })
    );
  }

  function handleToggleStatus(userId: string) {
    dispatch(userStatusToggled({ userId }));
  }

  return (
    <RequireRole currentRole={admin.role} allowedRoles={ADMIN_ROLES}>
      <section className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">Manage Users</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            SuperAdmin: view every account, adjust coin balances, and suspend or reactivate accounts.
          </p>
        </header>

        <div className="flex flex-col gap-3" aria-label="Managed users">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onAdjustCoins={(input) => handleAdjustCoins(user.id, input)}
              onToggleStatus={() => handleToggleStatus(user.id)}
            />
          ))}
        </div>
      </section>
    </RequireRole>
  );
}
