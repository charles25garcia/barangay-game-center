import { gamePlayed, milestoneClaimed, streakReducer } from "@code/state/streakSlice";
import type { StreakState } from "@shared/types";

const baseState: StreakState = {
  currentStreak: 9,
  longestStreak: 9,
  lastPlayedDate: "2026-09-20T08:00:00.000Z",
  claimedMilestoneDays: [],
};

describe("streakReducer", () => {
  it("increments the streak and longest streak on a consecutive day", () => {
    const next = streakReducer(baseState, gamePlayed({ timestamp: "2026-09-21T09:00:00.000Z" }));
    expect(next.currentStreak).toBe(10);
    expect(next.longestStreak).toBe(10);
    expect(next.lastPlayedDate).toBe("2026-09-21T09:00:00.000Z");
  });

  it("does not lower longestStreak after a reset", () => {
    const reset = streakReducer(baseState, gamePlayed({ timestamp: "2026-09-25T09:00:00.000Z" }));
    expect(reset.currentStreak).toBe(1);
    expect(reset.longestStreak).toBe(9);
  });

  it("records a claimed milestone once", () => {
    const claimedOnce = streakReducer(baseState, milestoneClaimed({ days: 10 }));
    const claimedTwice = streakReducer(claimedOnce, milestoneClaimed({ days: 10 }));
    expect(claimedTwice.claimedMilestoneDays).toEqual([10]);
  });
});
