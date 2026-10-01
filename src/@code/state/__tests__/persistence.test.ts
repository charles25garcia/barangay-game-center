import { loadPersistedState } from "@code/state/persistence";
import type { KeyValueStorage } from "@shared/interfaces";

function createStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const store = { ...initial };
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

describe("loadPersistedState", () => {
  it("returns the fallback when nothing is stored", () => {
    const storage = createStorage();
    expect(loadPersistedState("profile", { displayName: "Default" }, storage)).toEqual({
      displayName: "Default",
    });
  });

  it("returns the fallback when the stored value is malformed JSON", () => {
    const storage = createStorage({ "brgy-game-center:profile": "not json" });
    expect(loadPersistedState("profile", { displayName: "Default" }, storage)).toEqual({
      displayName: "Default",
    });
  });

  it("fills in fields missing from previously persisted state using the fallback", () => {
    const storage = createStorage({
      "brgy-game-center:profile": JSON.stringify({ displayName: "Juan" }),
    });

    const result = loadPersistedState(
      "profile",
      { displayName: "Default", role: "player" },
      storage
    );

    expect(result).toEqual({ displayName: "Juan", role: "player" });
  });

  it("replaces an array fallback entirely rather than merging by index", () => {
    const storage = createStorage({
      "brgy-game-center:games": JSON.stringify([{ id: "game-2" }]),
    });

    const result = loadPersistedState("games", [{ id: "game-1" }], storage);

    expect(result).toEqual([{ id: "game-2" }]);
  });
});
