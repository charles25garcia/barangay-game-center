import { validateMissionBonus } from "@shared/helpers";

describe("validateMissionBonus", () => {
  it("returns null for a valid bonus amount", () => {
    expect(validateMissionBonus(100)).toBeNull();
  });

  it("rejects a zero or negative amount", () => {
    expect(validateMissionBonus(0)).toMatch(/greater than zero/i);
    expect(validateMissionBonus(-10)).toMatch(/greater than zero/i);
  });

  it("rejects a non-integer amount", () => {
    expect(validateMissionBonus(50.5)).toMatch(/whole number/i);
  });
});
