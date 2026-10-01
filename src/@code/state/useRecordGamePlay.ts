"use client";

import { computeStreakUpdate } from "@shared/helpers";
import { STREAK_MILESTONES } from "@shared/utils";
import { useAppDispatch, useAppSelector } from "./hooks";
import { selectStreak } from "./selectors";
import { gamePlayed, milestoneClaimed } from "./streakSlice";
import { coinsCredited } from "./walletSlice";

/** Records a game play for streak tracking and auto-awards any newly reached streak milestone. */
export function useRecordGamePlay() {
  const dispatch = useAppDispatch();
  const streak = useAppSelector(selectStreak);

  return function recordGamePlay() {
    const timestamp = new Date().toISOString();
    const { streak: nextStreak } = computeStreakUpdate({
      currentStreak: streak.currentStreak,
      lastPlayedDate: streak.lastPlayedDate,
      now: timestamp,
    });

    dispatch(gamePlayed({ timestamp }));

    const milestone = STREAK_MILESTONES.find(
      (candidate) =>
        candidate.days === nextStreak && !streak.claimedMilestoneDays.includes(candidate.days)
    );

    if (milestone) {
      dispatch(coinsCredited({ amount: milestone.bonusCoins, reason: `${milestone.days}-day streak bonus` }));
      dispatch(milestoneClaimed({ days: milestone.days }));
    }
  };
}
