"use client";

import { MissionStatus } from "@shared/enums";
import {
  coinsCredited,
  missionClaimed,
  selectClaimedMissionIds,
  selectLifetimeCoinsSpent,
  selectMissions,
  selectStreak,
  useAppDispatch,
  useAppSelector,
} from "@code/state";
import { getMissionProgressTarget, getMissionProgressValue } from "@shared/helpers";
import { STREAK_MILESTONES } from "@shared/utils";
import { StreakBar } from "./components/StreakBar";
import { PlayerMissionCard } from "./components/PlayerMissionCard";

export function GameMissionsPage() {
  const dispatch = useAppDispatch();
  const missions = useAppSelector(selectMissions);
  const streak = useAppSelector(selectStreak);
  const claimedMissionIds = useAppSelector(selectClaimedMissionIds);
  const lifetimeCoinsSpent = useAppSelector(selectLifetimeCoinsSpent);

  const availableMissions = missions.filter((mission) => mission.status === MissionStatus.Active);

  function handleClaim(missionId: string, bonusCoins: number, title: string) {
    dispatch(missionClaimed({ missionId }));
    dispatch(coinsCredited({ amount: bonusCoins, reason: `Mission completed: ${title}` }));
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-bold text-white">Missions</h2>
        <p className="text-sm text-slate-400">
          Keep your play streak alive and complete missions to earn bonus coins.
        </p>
      </header>

      <StreakBar
        currentStreak={streak.currentStreak}
        milestones={STREAK_MILESTONES}
        claimedMilestoneDays={streak.claimedMilestoneDays}
      />

      <div className="flex flex-col gap-3" aria-label="Available missions">
        {availableMissions.map((mission) => {
          const progressTarget = getMissionProgressTarget(mission.id);
          const progressCurrent = getMissionProgressValue(mission.id, {
            streakDays: streak.currentStreak,
            lifetimeCoinsSpent,
          });

          return (
            <PlayerMissionCard
              key={mission.id}
              mission={mission}
              progressCurrent={progressCurrent}
              progressTarget={progressTarget}
              claimed={claimedMissionIds.includes(mission.id)}
              onClaim={() => handleClaim(mission.id, mission.bonusCoins, mission.title)}
            />
          );
        })}
      </div>
    </section>
  );
}
