import { getMissionProgressTarget, getMissionProgressValue } from "@shared/helpers";

describe("getMissionProgressTarget", () => {
  it("returns the correct target for known missions", () => {
    expect(getMissionProgressTarget("mission-weekly-play")).toBe(7);
    expect(getMissionProgressTarget("mission-spend-1000")).toBe(1000);
    expect(getMissionProgressTarget("mission-spend-10000")).toBe(10000);
    expect(getMissionProgressTarget("mission-spend-100000")).toBe(100000);
  });

  it("returns null for a mission with no automatic tracking", () => {
    expect(getMissionProgressTarget("mission-five-hour-streak")).toBeNull();
  });
});

describe("getMissionProgressValue", () => {
  const stats = { streakDays: 4, lifetimeCoinsSpent: 1500 };

  it("returns streak days for the weekly play mission", () => {
    expect(getMissionProgressValue("mission-weekly-play", stats)).toBe(4);
  });

  it("returns lifetime coins spent for spend missions", () => {
    expect(getMissionProgressValue("mission-spend-1000", stats)).toBe(1500);
    expect(getMissionProgressValue("mission-spend-100000", stats)).toBe(1500);
  });

  it("returns zero for a mission with no tracked metric", () => {
    expect(getMissionProgressValue("mission-five-hour-streak", stats)).toBe(0);
  });
});
