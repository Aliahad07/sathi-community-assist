/**
 * Shared demo data store for every dashboard.
 * Saved in this browser's localStorage only — nothing is sent anywhere.
 */
import { useSyncExternalStore } from "react";

import {
  approveApplication,
  createSeedState,
  parseSavedState,
  returnApplication,
  submitDocument,
  type DemoState,
} from "./demo-workflow";

export const DEMO_STORAGE_KEY = "sathi-demo-data";

// Server render and first client render both use the seed, so hydration matches.
const SEED = createSeedState();
let state: DemoState = SEED;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function loadFromStorage() {
  try {
    state = parseSavedState(window.localStorage.getItem(DEMO_STORAGE_KEY)) ?? createSeedState();
  } catch {
    state = createSeedState();
  }
  loaded = true;
}

function save(next: DemoState) {
  state = next;
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: keep the change for this visit only.
  }
  emit();
}

function onStorage(e: StorageEvent) {
  // Another tab changed the demo data: pick it up without a manual refresh.
  if (e.key !== DEMO_STORAGE_KEY && e.key !== null) return;
  loadFromStorage();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  if (!loaded) {
    loadFromStorage();
    queueMicrotask(emit);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useDemoStore(): DemoState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SEED,
  );
}

export const demoActions = {
  submitDocument(applicationId: string, fileName: string) {
    if (!loaded) loadFromStorage();
    save(submitDocument(state, applicationId, fileName, new Date().toISOString()));
  },
  approve(applicationId: string) {
    if (!loaded) loadFromStorage();
    save(approveApplication(state, applicationId, new Date().toISOString()));
  },
  returnWithReason(applicationId: string, reason: string) {
    if (!loaded) loadFromStorage();
    save(returnApplication(state, applicationId, reason, new Date().toISOString()));
  },
  reset() {
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // ignore
    }
    state = createSeedState();
    loaded = true;
    emit();
  },
};
