export function formatCoins(amount: number): string {
  return `${Math.max(0, Math.trunc(amount)).toLocaleString("en-US")} coins`;
}

export function clampNonNegative(amount: number): number {
  return Math.max(0, Math.trunc(amount));
}

export function isSameCalendarDay(isoDateA: string, isoDateB: string): boolean {
  return isoDateA.slice(0, 10) === isoDateB.slice(0, 10);
}
