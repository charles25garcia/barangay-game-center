export interface StreakMilestone {
  days: number;
  bonusCoins: number;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  claimedMilestoneDays: number[];
}
