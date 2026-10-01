import { CoinAdjustmentType } from "@shared/enums";

/** Returns a validation error message for a SuperAdmin coin adjustment, or null when valid. */
export function validateCoinAdjustment(params: {
  amount: number;
  type: CoinAdjustmentType;
  reason: string;
  balance: number;
}): string | null {
  const { amount, type, reason, balance } = params;

  if (!reason.trim()) {
    return "Enter a reason for this adjustment.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter an amount greater than zero.";
  }
  if (!Number.isInteger(amount)) {
    return "Coin amounts must be whole numbers.";
  }
  if (type === CoinAdjustmentType.Debit && amount > balance) {
    return "This user does not have enough coins for this deduction.";
  }
  return null;
}
