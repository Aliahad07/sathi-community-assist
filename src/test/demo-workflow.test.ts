import { describe, expect, it } from "vitest";

import {
  approveApplication,
  createSeedState,
  parseSavedState,
  returnApplication,
  stepFor,
  submitDocument,
  welcomeSummary,
} from "@/lib/demo-workflow";

const NOW = "2026-11-21T09:30:00.000Z";
const RETURNED_ID = "APP-DEMO-1050";
const IN_REVIEW_ID = "APP-DEMO-1021";

const find = (s: ReturnType<typeof createSeedState>, id: string) =>
  s.applications.find((a) => a.id === id);

describe("shared demo workflow", () => {
  it("keeps all 9 original demo applications in the seed", () => {
    expect(createSeedState().applications).toHaveLength(9);
  });

  it("citizen upload sets 'Document Submitted – Pending Review' and saves file name and time", () => {
    const s = submitDocument(createSeedState(), RETURNED_ID, "bill.png", NOW);
    const app = find(s, RETURNED_ID);
    expect(app?.status).toBe("doc_pending");
    expect(app?.submission).toEqual({ fileName: "bill.png", uploadedAt: NOW });
    expect(app?.note).toBeUndefined();
  });

  it("officer approval marks the application approved and completes the progress bar", () => {
    const uploaded = submitDocument(createSeedState(), RETURNED_ID, "bill.png", NOW);
    const s = approveApplication(uploaded, RETURNED_ID, NOW);
    expect(find(s, RETURNED_ID)?.status).toBe("approved");
    expect(find(s, RETURNED_ID)?.decision?.outcome).toBe("approved");
    expect(stepFor("approved")).toBe(4);
  });

  it("returning requires a reason", () => {
    expect(() => returnApplication(createSeedState(), IN_REVIEW_ID, "   ", NOW)).toThrow();
  });

  it("returning saves the officer's reason as the note the citizen sees", () => {
    const s = returnApplication(createSeedState(), IN_REVIEW_ID, "Photo is blurry", NOW);
    const app = find(s, IN_REVIEW_ID);
    expect(app?.status).toBe("returned");
    expect(app?.note).toBe("Photo is blurry");
    expect(app?.decision?.reason).toBe("Photo is blurry");
  });

  it("welcome message counts returned applications instead of a fixed number", () => {
    const seed = createSeedState();
    expect(welcomeSummary(seed.applications.filter((a) => a.citizenId))).toBe(
      "You have 3 applications. One needs your attention.",
    );
    const fixed = submitDocument(seed, RETURNED_ID, "bill.png", NOW);
    expect(welcomeSummary(fixed.applications.filter((a) => a.citizenId))).toBe(
      "You have 3 applications. None need your attention right now.",
    );
    const two = returnApplication(seed, IN_REVIEW_ID, "Missing form", NOW);
    expect(welcomeSummary(two.applications.filter((a) => a.citizenId))).toBe(
      "You have 3 applications. 2 need your attention.",
    );
  });

  it("ignores saved data that is missing or malformed", () => {
    expect(parseSavedState(null)).toBeNull();
    expect(parseSavedState("not json")).toBeNull();
    expect(parseSavedState(JSON.stringify({ version: 99 }))).toBeNull();
    const saved = JSON.stringify(createSeedState());
    expect(parseSavedState(saved)?.applications).toHaveLength(9);
  });
});
