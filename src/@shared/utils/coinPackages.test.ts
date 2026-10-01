import { findTestCoinPackage, TEST_COIN_PACKAGES } from "./coinPackages";

describe("test coin packages", () => {
  it("grants exactly one coin per whole peso", () => {
    for (const coinPackage of TEST_COIN_PACKAGES) {
      expect(coinPackage.amountMinor % 100).toBe(0);
      expect(coinPackage.coins).toBe(coinPackage.amountMinor / 100);
    }
  });

  it("looks up only server-defined package IDs", () => {
    expect(findTestCoinPackage("sandbox-10")?.coins).toBe(1);
    expect(findTestCoinPackage("sandbox-50")?.coins).toBe(5);
    expect(findTestCoinPackage("custom-price")).toBeUndefined();
  });
});