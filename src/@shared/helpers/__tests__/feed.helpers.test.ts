import { validateFeedPostContent } from "@shared/helpers";

describe("validateFeedPostContent", () => {
  it("returns null for valid content", () => {
    expect(validateFeedPostContent("Great game night!")).toBeNull();
  });

  it("rejects blank content", () => {
    expect(validateFeedPostContent("   ")).toMatch(/write something/i);
  });

  it("rejects content longer than 500 characters", () => {
    expect(validateFeedPostContent("a".repeat(501))).toMatch(/500 characters/i);
  });
});
