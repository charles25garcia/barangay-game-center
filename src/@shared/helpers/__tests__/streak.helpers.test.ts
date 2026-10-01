import { computeStreakUpdate } from "@shared/helpers";

describe("computeStreakUpdate", () => {
  it("starts a streak at 1 when there is no previous play date", () => {
    const result = computeStreakUpdate({ currentStreak: 0, lastPlayedDate: null, now: "2026-09-21T10:00:00.000Z" });
    expect(result).toEqual({ streak: 1, alreadyPlayedToday: false });
  });

  it("keeps the streak unchanged when playing again the same day", () => {
    const result = computeStreakUpdate({
      currentStreak: 5,
      lastPlayedDate: "2026-09-21T08:00:00.000Z",
      now: "2026-09-21T20:00:00.000Z",
    });
    expect(result).toEqual({ streak: 5, alreadyPlayedToday: true });
  });

  it("increments the streak when playing on the consecutive day", () => {
    const result = computeStreakUpdate({
      currentStreak: 5,
      lastPlayedDate: "2026-09-20T08:00:00.000Z",
      now: "2026-09-21T09:00:00.000Z",
    });
    expect(result).toEqual({ streak: 6, alreadyPlayedToday: false });
  });

  it("resets the streak to 1 when a day was missed", () => {
    const result = computeStreakUpdate({
      currentStreak: 5,
      lastPlayedDate: "2026-09-18T08:00:00.000Z",
      now: "2026-09-21T09:00:00.000Z",
    });
    expect(result).toEqual({ streak: 1, alreadyPlayedToday: false });
  });
});
