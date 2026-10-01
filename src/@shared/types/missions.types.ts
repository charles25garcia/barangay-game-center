import { MissionStatus } from "@shared/enums";

export interface Mission {
  id: string;
  title: string;
  description: string;
  bonusCoins: number;
  status: MissionStatus;
}

export interface MissionBonusUpdateInput {
  missionId: string;
  bonusCoins: number;
}
