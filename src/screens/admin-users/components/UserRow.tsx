"use client";

import { useState } from "react";
import { Avatar, Button, Card } from "@shared/components";
import { CoinAdjustmentType, UserStatus } from "@shared/enums";
import type { ManagedUser } from "@shared/types";
import { formatCoins, ROLE_LABELS } from "@shared/utils";
import { AdjustCoinsForm } from "./AdjustCoinsForm";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserRowProps {
  user: ManagedUser;
  onAdjustCoins: (input: { type: CoinAdjustmentType; amount: number; reason: string }) => void;
  onToggleStatus: () => void;
}

export function UserRow({ user, onAdjustCoins, onToggleStatus }: UserRowProps) {
  const [isAdjusting, setIsAdjusting] = useState(false);

  return (
    <Card className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
        <div className="flex min-w-0 items-center gap-3 lg:col-span-5">
          <Avatar emoji={user.avatarEmoji} name={user.displayName} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--navy)]">{user.displayName}</p>
            <p className="truncate text-xs text-[var(--muted)]">
              {ROLE_LABELS[user.role]} · {user.homeBarangay}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:col-span-3 lg:justify-start">
          <UserStatusBadge status={user.status} />
          <span className="whitespace-nowrap text-sm font-semibold text-[var(--gold)]">{formatCoins(user.coinBalance)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:col-span-4">
          <Button className="w-full" variant="secondary" onClick={() => setIsAdjusting((prev) => !prev)}>
            {isAdjusting ? "Cancel" : "Adjust coins"}
          </Button>
          <Button
            className="w-full"
            variant={user.status === UserStatus.Active ? "danger" : "primary"}
            onClick={onToggleStatus}
          >
            {user.status === UserStatus.Active ? "Suspend" : "Activate"}
          </Button>
        </div>
      </div>

      {isAdjusting ? (
        <AdjustCoinsForm
          balance={user.coinBalance}
          onAdjust={(input) => {
            onAdjustCoins(input);
            setIsAdjusting(false);
          }}
        />
      ) : null}
    </Card>
  );
}
