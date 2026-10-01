import { CoinAdjustmentType } from "@shared/enums";
import { validateCoinAdjustment } from "@shared/helpers";

const baseParams = {
  amount: 50,
  type: CoinAdjustmentType.Credit,
  reason: "Bonus",
  balance: 100,
};

describe("validateCoinAdjustment", () => {
  it("returns null for a valid credit", () => {
    expect(validateCoinAdjustment(baseParams)).toBeNull();
  });

  it("requires a reason", () => {
    expect(validateCoinAdjustment({ ...baseParams, reason: "  " })).toMatch(/reason/i);
  });

  it("rejects a zero or negative amount", () => {
    expect(validateCoinAdjustment({ ...baseParams, amount: 0 })).toMatch(/greater than zero/i);
  });

  it("rejects a non-integer amount", () => {
    expect(validateCoinAdjustment({ ...baseParams, amount: 5.5 })).toMatch(/whole numbers/i);
  });

  it("rejects a debit greater than the user's balance", () => {
    expect(
      validateCoinAdjustment({ ...baseParams, type: CoinAdjustmentType.Debit, amount: 200 })
    ).toMatch(/enough coins/i);
  });

  it("allows a debit within the user's balance", () => {
    expect(validateCoinAdjustment({ ...baseParams, type: CoinAdjustmentType.Debit, amount: 50 })).toBeNull();
  });
});
