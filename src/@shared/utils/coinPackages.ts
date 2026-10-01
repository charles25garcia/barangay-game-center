import type { CoinPackage } from "@shared/types";

export const TEST_COIN_PACKAGES: CoinPackage[] = [
  { id: "sandbox-10", name: "Sandbox Starter", amountMinor: 100, coins: 1 },
  { id: "sandbox-50", name: "Sandbox Boost", amountMinor: 500, coins: 5 },
];

export function findTestCoinPackage(packageId: string): CoinPackage | undefined {
  return TEST_COIN_PACKAGES.find((coinPackage) => coinPackage.id === packageId);
}
