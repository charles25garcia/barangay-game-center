import { validateShareAmount } from "@shared/helpers";

const baseParams = {
  amount: 20,
  balance: 100,
  dailyRemaining: 50,
  recipientName: "Maria",
  selfName: "Juan",
};

describe("validateShareAmount", () => {
  it("returns null for a valid transfer", () => {
    expect(validateShareAmount(baseParams)).toBeNull();
  });

  it("requires a recipient", () => {
    expect(validateShareAmount({ ...baseParams, recipientName: "  " })).toMatch(/recipient/i);
  });

  it("rejects sharing with yourself", () => {
    expect(validateShareAmount({ ...baseParams, recipientName: "juan" })).toMatch(/yourself/i);
  });

  it("rejects a zero or negative amount", () => {
    expect(validateShareAmount({ ...baseParams, amount: 0 })).toMatch(/greater than zero/i);
    expect(validateShareAmount({ ...baseParams, amount: -5 })).toMatch(/greater than zero/i);
  });

  it("rejects a non-integer amount", () => {
    expect(validateShareAmount({ ...baseParams, amount: 5.5 })).toMatch(/whole numbers/i);
  });

  it("rejects an amount greater than the balance", () => {
    expect(validateShareAmount({ ...baseParams, amount: 150 })).toMatch(/enough coins/i);
  });

  it("rejects an amount greater than the daily remaining limit", () => {
    expect(validateShareAmount({ ...baseParams, amount: 60, balance: 200 })).toMatch(/daily/i);
  });
});
