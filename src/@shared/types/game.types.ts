import { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";

export interface Game {
  id: string;
  slug: string;
  name: string;
  provider: string;
  description: string;
  category: GameCategory;
  costPerPlay: number;
  badge?: string;
  launchType: GameLaunchType;
  launchTarget: string;
  status: GameStatus;
}
