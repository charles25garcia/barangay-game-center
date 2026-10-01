import { render, screen } from "@testing-library/react";
import { RequireRole } from "@code/guards/RequireRole";
import { AuthorRole } from "@shared/enums";

describe("RequireRole", () => {
  it("renders children when the current role is allowed", () => {
    render(
      <RequireRole currentRole={AuthorRole.SuperAdmin} allowedRoles={[AuthorRole.SuperAdmin, AuthorRole.BrgyAdmin]}>
        <p>Protected content</p>
      </RequireRole>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("renders a restricted message when the current role is not allowed", () => {
    render(
      <RequireRole currentRole={AuthorRole.Player} allowedRoles={[AuthorRole.SuperAdmin, AuthorRole.BrgyAdmin]}>
        <p>Protected content</p>
      </RequireRole>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });
});
