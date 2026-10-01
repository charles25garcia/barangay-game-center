"use client";

import { useState } from "react";
import { Button, Card } from "@shared/components";
import {
  adminUsersReset,
  catalogReset,
  feedReset,
  missionsReset,
  playerMissionsReset,
  profileReset,
  resetPersistedDemoData,
  streakReset,
  useAppDispatch,
  walletReset,
} from "@code/state";

export function ResetDemoDataCard() {
  const dispatch = useAppDispatch();
  const [confirmed, setConfirmed] = useState(false);

  function handleReset() {
    dispatch(profileReset());
    dispatch(walletReset());
    dispatch(catalogReset());
    dispatch(feedReset());
    dispatch(adminUsersReset());
    dispatch(missionsReset());
    dispatch(streakReset());
    dispatch(playerMissionsReset());
    resetPersistedDemoData();
    setConfirmed(true);
  }

  return (
    <Card className="flex flex-col gap-3 border-rose-900/60">
      <h3 className="font-semibold text-white">Reset demo data</h3>
      <p className="text-sm text-slate-400">
        Restores your profile, coin balance, and game catalog to the original seed data in the shared
        SQLite database.
      </p>
      <Button variant="danger" onClick={handleReset} className="self-start">
        Reset demo data
      </Button>
      {confirmed ? (
        <p role="status" className="text-sm text-emerald-400">
          Demo data has been reset.
        </p>
      ) : null}
    </Card>
  );
}
