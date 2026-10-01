import { missionClaimed, playerMissionsReducer } from "@code/state/playerMissionsSlice";

describe("playerMissionsReducer", () => {
  it("adds a mission id when claimed", () => {
    const next = playerMissionsReducer({ claimedMissionIds: [] }, missionClaimed({ missionId: "mission-a" }));
    expect(next.claimedMissionIds).toEqual(["mission-a"]);
  });

  it("does not duplicate an already-claimed mission id", () => {
    const state = { claimedMissionIds: ["mission-a"] };
    const next = playerMissionsReducer(state, missionClaimed({ missionId: "mission-a" }));
    expect(next).toBe(state);
  });
});
