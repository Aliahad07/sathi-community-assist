import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { roles } from "@/lib/roles";

describe("demo roles", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("citizen, helper and officer each open a real dashboard page", () => {
    for (const id of ["citizen", "helper", "officer"] as const) {
      const role = roles.find((r) => r.id === id);
      expect(role?.path).toBe(`/${id}`);
      const matches = router.matchRoutes(`/${id}`);
      expect(matches.at(-1)?.routeId).toBe(`/${id}`);
    }
  });

  it("administrator is listed but has no dashboard in this stage", () => {
    const admin = roles.find((r) => r.id === "admin");
    expect(admin).toBeDefined();
    expect(admin?.path).toBeNull();
  });

  it("login page exists", () => {
    expect(router.matchRoutes("/login").at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
