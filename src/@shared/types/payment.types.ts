export interface CoinPackage {
  id: string;
  name: string;
  amountMinor: number;
  coins: number;
}

export type CoinPurchaseStatus = "pending" | "paid" | "failed";

export interface CoinPurchaseStatusResponse {
  id: string;
  status: CoinPurchaseStatus;
  coins: number;
  amountMinor: number;
  paidAt: string | null;
}
