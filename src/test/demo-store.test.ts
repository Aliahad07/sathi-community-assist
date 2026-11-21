import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DEMO_STORAGE_KEY, demoActions, useDemoStore } from "@/lib/demo-store";

describe("demo store", () => {
  beforeEach(() => {
    act(() => demoActions.reset());
  });

  it("saves changes to localStorage so they survive a reload", () => {
    const { result } = renderHook(() => useDemoStore());
    act(() => demoActions.submitDocument("APP-DEMO-1050", "bill.png"));
    act(() => demoActions.approve("APP-DEMO-1050"));
    expect(result.current.applications.find((a) => a.id === "APP-DEMO-1050")?.status).toBe(
      "approved",
    );
    const saved = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? "{}");
    expect(saved.applications.find((a: { id: string }) => a.id === "APP-DEMO-1050").status).toBe(
      "approved",
    );
  });

  it("reset restores the original records and clears saved data", () => {
    const { result } = renderHook(() => useDemoStore());
    act(() => demoActions.approve("APP-DEMO-1021"));
    act(() => demoActions.reset());
    expect(window.localStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();
    expect(result.current.applications.find((a) => a.id === "APP-DEMO-1021")?.status).toBe(
      "in_review",
    );
    expect(result.current.applications.find((a) => a.id === "APP-DEMO-1050")?.status).toBe(
      "returned",
    );
  });
});
