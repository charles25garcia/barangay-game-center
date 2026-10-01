import { TransactionType } from "@shared/enums";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  reason: string;
  createdAt: string;
  relatedGameId?: string;
  counterpartyName?: string;
  source?: string;
}

export interface WalletState {
  balance: number;
  dailyShareLimit: number;
  sharedToday: number;
  lastShareDate: string | null;
  transactions: WalletTransaction[];
}

export interface ShareCoinsInput {
  recipientName: string;
  amount: number;
  note?: string;
}
