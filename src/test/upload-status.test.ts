import { describe, expect, it } from "vitest";

import { citizenDocuments, demoApplications, statusMeta } from "@/lib/mock-data";

describe("document re-upload flow", () => {
  it("uses the exact status text after a document is submitted", () => {
    expect(statusMeta.doc_pending.label).toBe("Document Submitted – Pending Review");
  });

  it("demo data starts with a returned application and a document needing update", () => {
    expect(demoApplications.some((a) => a.status === "returned")).toBe(true);
    expect(citizenDocuments.some((d) => d.status === "needs_update")).toBe(true);
  });
});
