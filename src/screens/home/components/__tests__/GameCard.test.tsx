import { render, screen, fireEvent } from "@testing-library/react";
import { GameCard } from "@screens/home/components/GameCard";
import { GameCategory, GameLaunchType, GameStatus } from "@shared/enums";
import type { Game } from "@shared/types";

const activeGame: Game = {
  id: "game-1",
  slug: "test-game",
  name: "Test Game",
  provider: "Brgy Game Center",
  description: "A test game.",
  category: GameCategory.Arcade,
  costPerPlay: 10,
  launchType: GameLaunchType.ExternalUrl,
  launchTarget: "https://example.com",
  status: GameStatus.Active,
};

describe("GameCard", () => {
  it("enables play when the player can afford the game", () => {
    const onPlay = jest.fn();
    render(<GameCard game={activeGame} balance={50} onPlay={onPlay} />);

    const button = screen.getByRole("button", { name: /play test game/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onPlay).toHaveBeenCalledWith(activeGame);
  });

  it("disables play when the balance is insufficient", () => {
    const onPlay = jest.fn();
    render(<GameCard game={activeGame} balance={5} onPlay={onPlay} />);

    expect(screen.getByRole("button", { name: /not enough coins/i })).toBeDisabled();
  });

  it("disables play for a coming-soon game", () => {
    const comingSoonGame: Game = { ...activeGame, status: GameStatus.ComingSoon };
    render(<GameCard game={comingSoonGame} balance={50} onPlay={jest.fn()} />);

    expect(screen.getByRole("button", { name: /coming soon/i })).toBeDisabled();
  });
});
