import { isSameCalendarDay } from "@shared/utils";

function toDateOnly(isoDate: string): number {
  const date = new Date(isoDate);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isConsecutiveDay(previousIso: string, nowIso: string): boolean {
  const diffDays = (toDateOnly(nowIso) - toDateOnly(previousIso)) / (24 * 60 * 60 * 1000);
  return diffDays === 1;
}

/** Computes the next streak count and whether the player already played today. */
export function computeStreakUpdate(params: {
  currentStreak: number;
  lastPlayedDate: string | null;
  now: string;
}): { streak: number; alreadyPlayedToday: boolean } {
  const { currentStreak, lastPlayedDate, now } = params;

  if (!lastPlayedDate) {
    return { streak: 1, alreadyPlayedToday: false };
  }
  if (isSameCalendarDay(lastPlayedDate, now)) {
    return { streak: currentStreak, alreadyPlayedToday: true };
  }
  if (isConsecutiveDay(lastPlayedDate, now)) {
    return { streak: currentStreak + 1, alreadyPlayedToday: false };
  }
  return { streak: 1, alreadyPlayedToday: false };
}
