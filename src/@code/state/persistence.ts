import type { KeyValueStorage } from "@shared/interfaces";
import { browserStorage } from "./browserStorage";

export const STORAGE_PREFIX = "brgy-game-center:";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadPersistedState<T>(
  key: string,
  fallback: T,
  storage: KeyValueStorage = browserStorage
): T {
  const raw = storage.getItem(STORAGE_PREFIX + key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    if (parsed == null) return fallback;
    // Shallow-merge onto the fallback so fields added after a user already persisted state (e.g. a new
    // profile field) still get a default value instead of being silently undefined.
    if (isPlainObject(parsed) && isPlainObject(fallback)) {
      return { ...fallback, ...parsed } as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function savePersistedState<T>(
  key: string,
  value: T,
  storage: KeyValueStorage = browserStorage
): void {
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Serialization failures should not crash the app in a prototype.
  }
}

export function clearPersistedState(keys: string[], storage: KeyValueStorage = browserStorage): void {
  keys.forEach((key) => storage.removeItem(STORAGE_PREFIX + key));
}
