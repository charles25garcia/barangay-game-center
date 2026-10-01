import type { KeyValueStorage } from "@shared/interfaces";

/** Browser localStorage adapter. Falls back to a no-op storage during server-side rendering. */
export const browserStorage: KeyValueStorage = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable (private mode, quota exceeded); fail silently for a prototype.
    }
  },
  removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore removal failures.
    }
  },
};
