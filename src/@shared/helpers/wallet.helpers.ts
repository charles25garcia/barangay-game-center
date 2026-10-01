/** Returns a validation error message for a coin-share request, or null when valid. */
export function validateShareAmount(params: {
  amount: number;
  balance: number;
  dailyRemaining: number;
  recipientName: string;
  selfName: string;
}): string | null {
  const { amount, balance, dailyRemaining, recipientName, selfName } = params;

  if (!recipientName.trim()) {
    return "Choose a recipient to share coins with.";
  }
  if (recipientName.trim().toLowerCase() === selfName.trim().toLowerCase()) {
    return "You cannot share coins with yourself.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter an amount greater than zero.";
  }
  if (!Number.isInteger(amount)) {
    return "Coin amounts must be whole numbers.";
  }
  if (amount > balance) {
    return "You do not have enough coins for this transfer.";
  }
  if (amount > dailyRemaining) {
    return "This transfer exceeds your remaining daily sharing limit.";
  }
  return null;
}
