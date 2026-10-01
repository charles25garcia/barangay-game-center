const MISSION_PROGRESS_TARGETS: Record<string, number> = {
  "mission-weekly-play": 7,
  "mission-spend-1000": 1000,
  "mission-spend-10000": 10000,
  "mission-spend-100000": 100000,
};

/** Returns the numeric target for a mission's progress, or null when it cannot be tracked automatically. */
export function getMissionProgressTarget(missionId: string): number | null {
  return MISSION_PROGRESS_TARGETS[missionId] ?? null;
}

/** Returns the player's current progress value for a mission based on tracked lifetime stats. */
export function getMissionProgressValue(
  missionId: string,
  stats: { streakDays: number; lifetimeCoinsSpent: number }
): number {
  if (missionId === "mission-weekly-play") {
    return stats.streakDays;
  }
  if (missionId in MISSION_PROGRESS_TARGETS) {
    return stats.lifetimeCoinsSpent;
  }
  return 0;
}
