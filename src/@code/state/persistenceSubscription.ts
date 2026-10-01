import type { AppStore, RootState } from "./store";

const PERSIST_DEBOUNCE_MS = 200;

/** Persists shared Redux state to the SQLite API after client-side changes settle. */
export function subscribeForPersistence(store: AppStore): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastState: RootState | null = null;

  const flush = () => {
    if (!lastState) return;
    void fetch("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lastState),
    });
  };

  const unsubscribe = store.subscribe(() => {
    lastState = store.getState();
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(flush, PERSIST_DEBOUNCE_MS);
  });

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    unsubscribe();
  };
}

export function resetPersistedDemoData(): void {
  void fetch("/api/state", { method: "DELETE" });
}
