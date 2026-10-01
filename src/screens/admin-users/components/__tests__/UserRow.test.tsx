import { render, screen, fireEvent } from "@testing-library/react";
import { UserRow } from "@screens/admin-users/components/UserRow";
import { AuthorRole, UserStatus } from "@shared/enums";
import type { ManagedUser } from "@shared/types";

const user: ManagedUser = {
  id: "user-a",
  displayName: "Test User",
  avatarEmoji: "🧑",
  homeBarangay: "Barangay Test",
  role: AuthorRole.Player,
  status: UserStatus.Active,
  coinBalance: 100,
};

describe("UserRow", () => {
  it("renders user details and toggles status", () => {
    const onToggleStatus = jest.fn();
    render(<UserRow user={user} onAdjustCoins={jest.fn()} onToggleStatus={onToggleStatus} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /suspend/i }));
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it("reveals the coin adjustment form and submits a credit", () => {
    const onAdjustCoins = jest.fn();
    render(<UserRow user={user} onAdjustCoins={onAdjustCoins} onToggleStatus={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /adjust coins/i }));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: "Bonus" } });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onAdjustCoins).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 25, reason: "Bonus" })
    );
  });
});
