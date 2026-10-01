"use client";

import { RequireRole } from "@code/guards";
import {
  missionBonusUpdated,
  missionStatusToggled,
  selectMissions,
  selectPlayerProfile,
  useAppDispatch,
  useAppSelector,
} from "@code/state";
import { ADMIN_ROLES } from "@shared/utils";
import { MissionRow } from "./components/MissionRow";

export function AdminMissionsPage() {
  const dispatch = useAppDispatch();
  const missions = useAppSelector(selectMissions);
  const profile = useAppSelector(selectPlayerProfile);

  function handleUpdateBonus(missionId: string, bonusCoins: number) {
    dispatch(missionBonusUpdated({ missionId, bonusCoins }));
  }

  function handleToggleStatus(missionId: string) {
    dispatch(missionStatusToggled({ missionId }));
  }

  return (
    <RequireRole currentRole={profile.role} allowedRoles={ADMIN_ROLES}>
      <section className="flex flex-col gap-6">
        <header>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--navy)]">Missions Manager</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            SuperAdmin: set the bonus coin reward for each mission and activate or deactivate it.
          </p>
        </header>

        <div className="flex flex-col gap-3" aria-label="Missions">
          {missions.map((mission) => (
            <MissionRow
              key={mission.id}
              mission={mission}
              onUpdateBonus={(bonusCoins) => handleUpdateBonus(mission.id, bonusCoins)}
              onToggleStatus={() => handleToggleStatus(mission.id)}
            />
          ))}
        </div>
      </section>
    </RequireRole>
  );
}
