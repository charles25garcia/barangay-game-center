import { AuthorRole, CoinAdjustmentType, UserStatus } from "@shared/enums";

export interface ManagedUser {
  id: string;
  displayName: string;
  avatarEmoji: string;
  homeBarangay: string;
  role: AuthorRole;
  status: UserStatus;
  coinBalance: number;
}

export interface CoinHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  adjustmentType: CoinAdjustmentType;
  amount: number;
  reason: string;
  adminName: string;
  createdAt: string;
}

export interface CoinAdjustmentInput {
  userId: string;
  type: CoinAdjustmentType;
  amount: number;
  reason: string;
}
