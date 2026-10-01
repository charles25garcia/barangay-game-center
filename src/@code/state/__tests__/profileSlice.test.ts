import { profileReducer, profileUpdated } from "@code/state/profileSlice";
import { AuthorRole } from "@shared/enums";
import type { Player } from "@shared/types";

const initialState: Player = {
  id: "player-1",
  displayName: "Original Name",
  avatarEmoji: "🧑",
  homeBarangay: "Barangay Original",
  bio: "Original bio",
  role: AuthorRole.Player,
};

describe("profileReducer", () => {
  it("updates all editable fields", () => {
    const next = profileReducer(
      initialState,
      profileUpdated({
        displayName: "New Name",
        avatarEmoji: "🧑\u200d🚀",
        homeBarangay: "Barangay New",
        bio: "New bio",
        role: AuthorRole.BrgyAdmin,
      })
    );

    expect(next).toMatchObject({
      displayName: "New Name",
      avatarEmoji: "🧑\u200d🚀",
      homeBarangay: "Barangay New",
      bio: "New bio",
      role: AuthorRole.BrgyAdmin,
    });
    expect(next.id).toBe("player-1");
  });

  it("keeps existing display name when a blank value is submitted", () => {
    const next = profileReducer(
      initialState,
      profileUpdated({
        displayName: "   ",
        avatarEmoji: "🧑",
        homeBarangay: "Barangay Original",
        bio: "",
        role: AuthorRole.Player,
      })
    );

    expect(next.displayName).toBe("Original Name");
    expect(next.bio).toBe("");
  });
});
