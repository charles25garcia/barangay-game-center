import { MissionStatus } from "@shared/enums";
import { missionBonusUpdated, missionStatusToggled, missionsReducer } from "@code/state/missionsSlice";
import type { Mission } from "@shared/types";

const baseState: Mission[] = [
  {
    id: "mission-a",
    title: "Test Mission",
    description: "A test mission.",
    bonusCoins: 100,
    status: MissionStatus.Active,
  },
];

describe("missionsReducer", () => {
  it("updates the bonus coins for a mission", () => {
    const next = missionsReducer(baseState, missionBonusUpdated({ missionId: "mission-a", bonusCoins: 250 }));
    expect(next[0].bonusCoins).toBe(250);
  });

  it("ignores an update for an unknown mission", () => {
    const next = missionsReducer(
      baseState,
      missionBonusUpdated({ missionId: "missing", bonusCoins: 250 })
    );
    expect(next).toBe(baseState);
  });

  it("ignores a zero bonus update", () => {
    const next = missionsReducer(baseState, missionBonusUpdated({ missionId: "mission-a", bonusCoins: 0 }));
    expect(next).toBe(baseState);
  });

  it("toggles mission status between active and inactive", () => {
    const deactivated = missionsReducer(baseState, missionStatusToggled({ missionId: "mission-a" }));
    expect(deactivated[0].status).toBe(MissionStatus.Inactive);

    const reactivated = missionsReducer(deactivated, missionStatusToggled({ missionId: "mission-a" }));
    expect(reactivated[0].status).toBe(MissionStatus.Active);
  });
});
