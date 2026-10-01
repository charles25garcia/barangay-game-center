/** Returns a validation error message for a mission bonus amount, or null when valid. */
export function validateMissionBonus(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter a bonus amount greater than zero.";
  }
  if (!Number.isInteger(amount)) {
    return "Bonus coins must be a whole number.";
  }
  return null;
}
