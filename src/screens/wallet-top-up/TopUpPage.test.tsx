import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TopUpPage } from "./TopUpPage";

jest.mock("@code/state", () => ({
  selectWalletBalance: jest.fn(),
  useAppSelector: () => 250,
}));

jest.mock("@shared/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CoinBadge: ({ amount, label }: { amount: number; label: string }) => <div>{label}: {amount}</div>,
}));

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe("TopUpPage", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("keeps package checkout disabled when sandbox credentials are unavailable", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ enabled: false, mode: "test" })) as typeof fetch;

    render(<TopUpPage />);

    expect(await screen.findByText(/test keys and a test webhook secret are required/i)).toBeInTheDocument();
    const buttons = await screen.findAllByRole("button", { name: "Continue to test checkout" });
    const button = buttons[0];
    expect(button).toBeDisabled();
  });

  it("redirects only to the checkout URL returned by the server", async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(jsonResponse({ enabled: true, mode: "test" }))
      .mockResolvedValueOnce(jsonResponse({ checkoutUrl: "https://checkout.paymongo.test/session" }, 201));
    global.fetch = fetchMock as typeof fetch;
    const assign = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { search: "", assign, replace: jest.fn() },
    });

    render(<TopUpPage />);

    const buttons = await screen.findAllByRole("button", { name: "Continue to test checkout" });
    const button = buttons[0];
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);

    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.paymongo.test/session"));
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ packageId: "sandbox-10" }),
    });
  });
});
