import { render, screen, fireEvent } from "@testing-library/react";
import { MissionRow } from "@screens/admin-missions/components/MissionRow";
import { MissionStatus } from "@shared/enums";
import type { Mission } from "@shared/types";

const mission: Mission = {
  id: "mission-a",
  title: "Test Mission",
  description: "A test mission.",
  bonusCoins: 100,
  status: MissionStatus.Active,
};

describe("MissionRow", () => {
  it("renders mission details and toggles status", () => {
    const onToggleStatus = jest.fn();
    render(<MissionRow mission={mission} onUpdateBonus={jest.fn()} onToggleStatus={onToggleStatus} />);

    expect(screen.getByText("Test Mission")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /deactivate/i }));
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it("reveals the bonus form and submits an updated bonus", () => {
    const onUpdateBonus = jest.fn();
    render(<MissionRow mission={mission} onUpdateBonus={onUpdateBonus} onToggleStatus={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /edit bonus/i }));
    fireEvent.change(screen.getByLabelText(/bonus coins/i), { target: { value: "300" } });
    fireEvent.click(screen.getByRole("button", { name: /save bonus/i }));

    expect(onUpdateBonus).toHaveBeenCalledWith(300);
  });
});
