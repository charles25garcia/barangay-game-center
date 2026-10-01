"use client";

import { Badge } from "./Badge";
import { Button, Card } from "@shared/components";
import { GameLaunchType, GameStatus } from "@shared/enums";
import type { Game } from "@shared/types";
import { formatCoins } from "@shared/utils";

interface GameCardProps {
  game: Game;
  balance: number;
  onPlay: (game: Game) => void;
}

export function GameCard({ game, balance, onPlay }: GameCardProps) {
  const isComingSoon = game.status === GameStatus.ComingSoon;
  const isDisabled = game.status === GameStatus.Disabled;
  const canAfford = balance >= game.costPerPlay;
  const playDisabled = isComingSoon || isDisabled || !canAfford;

  const playLabel = isComingSoon
    ? "Coming soon"
    : !canAfford
      ? "Not enough coins"
      : game.launchType === GameLaunchType.ExternalUrl
        ? "Play"
        : "Launch";

  return (
    <Card className="platform-rise flex flex-col gap-3 transition duration-300 hover:-translate-y-1 hover:border-[var(--teal)] hover:shadow-lg hover:shadow-emerald-950/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-[var(--navy)]">{game.name}</h3>
          <p className="text-xs font-medium text-[var(--muted)]">{game.provider}</p>
        </div>
        {game.badge ? <Badge label={game.badge} /> : null}
      </div>

      <p className="text-sm leading-6 text-[var(--muted)]">{game.description}</p>

      <div className="flex items-center justify-between text-sm text-[var(--muted)]">
        <span>Cost: {formatCoins(game.costPerPlay)}</span>
      </div>

      <Button
        variant={playDisabled ? "secondary" : "primary"}
        disabled={playDisabled}
        onClick={() => onPlay(game)}
        aria-label={`${playLabel} ${game.name}`}
      >
        {playLabel}
      </Button>
    </Card>
  );
}
