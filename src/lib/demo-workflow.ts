/**
 * Pure state changes for the shared demo workflow (citizen upload → officer decision).
 * No I/O here so the rules can be tested directly.
 */
import {
  citizenDocuments,
  demoApplications,
  demoOfficer,
  type AppStatus,
  type DemoApplication,
  type DemoDocument,
} from "./mock-data";

export const DEMO_STATE_VERSION = 1;

export interface DemoState {
  version: typeof DEMO_STATE_VERSION;
  applications: DemoApplication[];
  documents: DemoDocument[];
}

export function createSeedState(): DemoState {
  return {
    version: DEMO_STATE_VERSION,
    applications: structuredClone(demoApplications),
    documents: structuredClone(citizenDocuments),
  };
}

/** Progress step (1-4) shown on the citizen tracker, derived from status. */
export function stepFor(status: AppStatus): number {
  switch (status) {
    case "submitted":
      return 1;
    case "in_review":
    case "returned":
    case "doc_pending":
      return 2;
    case "approved":
      return 4;
  }
}

/** Statuses an officer can still act on. */
export function isOpenForDecision(status: AppStatus): boolean {
  return status === "submitted" || status === "in_review" || status === "doc_pending";
}

export function attentionCount(apps: DemoApplication[]): number {
  return apps.filter((a) => a.status === "returned").length;
}

export function welcomeSummary(apps: DemoApplication[]): string {
  const total = `You have ${apps.length} application${apps.length === 1 ? "" : "s"}.`;
  const n = attentionCount(apps);
  if (n === 0) return `${total} None need your attention right now.`;
  if (n === 1) return `${total} One needs your attention.`;
  return `${total} ${n} need your attention.`;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function submitDocument(
  state: DemoState,
  applicationId: string,
  fileName: string,
  now: string,
): DemoState {
  return {
    ...state,
    applications: state.applications.map((a) => {
      if (a.id !== applicationId) return a;
      const { note: _note, ...rest } = a;
      return { ...rest, status: "doc_pending", submission: { fileName, uploadedAt: now } };
    }),
    documents: state.documents.map((d) =>
      d.applicationId === applicationId
        ? { ...d, status: "pending", fileName, updated: `${formatDay(now)} (demo)` }
        : d,
    ),
  };
}

export function approveApplication(state: DemoState, applicationId: string, now: string): DemoState {
  return {
    ...state,
    applications: state.applications.map((a) => {
      if (a.id !== applicationId) return a;
      const { note: _note, ...rest } = a;
      return {
        ...rest,
        status: "approved",
        decision: { outcome: "approved", decidedAt: now, officer: demoOfficer.name },
      };
    }),
    documents: state.documents.map((d) =>
      d.applicationId === applicationId ? { ...d, status: "verified" } : d,
    ),
  };
}

export function returnApplication(
  state: DemoState,
  applicationId: string,
  reason: string,
  now: string,
): DemoState {
  const trimmed = reason.trim();
  if (!trimmed) throw new Error("A reason is required to return an application.");
  return {
    ...state,
    applications: state.applications.map((a) =>
      a.id === applicationId
        ? {
            ...a,
            status: "returned",
            note: trimmed,
            decision: {
              outcome: "returned",
              reason: trimmed,
              decidedAt: now,
              officer: demoOfficer.name,
            },
          }
        : a,
    ),
    documents: state.documents.map((d) =>
      d.applicationId === applicationId ? { ...d, status: "needs_update" } : d,
    ),
  };
}

/** Accepts saved data only if it has the shape this version expects. */
export function parseSavedState(raw: string | null): DemoState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<DemoState>;
    if (
      data.version !== DEMO_STATE_VERSION ||
      !Array.isArray(data.applications) ||
      !Array.isArray(data.documents)
    ) {
      return null;
    }
    return data as DemoState;
  } catch {
    return null;
  }
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
