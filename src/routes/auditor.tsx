
import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Brain,
  FileText,
  RefreshCw,
  ShieldCheck,
  Users,
  Search,
  AlertTriangle,
} from "lucide-react";
import { DashboardShell } from "@/components/sathi/DashboardShell";
import { getSupabase } from "@/lib/supabase";

type AuditLog = {
  id: string;
  actor_role: string | null;
  action: string | null;
  entity_table: string | null;
  entity_id: string | null;
  changed_columns: string[] | null;
  event_details: Record<string, unknown> | null;
  created_at: string;
};

type AIDecision = {
  id: string;
  application_id: string | null;
  decision_type: string | null;
  model_name: string | null;
  confidence: number | null;
  outcome: string | null;
  user_explanation: string | null;
  auditor_trace: unknown;
  human_required: boolean | null;
  created_at: string;
};

type Consent = {
  id: string;
  family_id: string;
  helper_id: string;
  status: string;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
};

type Application = {
  id: string;
  application_type: string;
  status: string;
  created_at: string;
};

function AuditorDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "audit" | "ai" | "consent" | "applications"
  >("overview");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabase();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please log in again.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || profile?.role !== "auditor") {
        throw new Error("Auditor access required.");
      }

      const [auditResult, aiResult, consentResult, appResult] =
        await Promise.all([
          supabase
            .from("audit_logs")
            .select(
              "id, actor_role, action, entity_table, entity_id, changed_columns, event_details, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(100),

          supabase
            .from("ai_decisions")
            .select(
              "id, application_id, decision_type, model_name, confidence, outcome, user_explanation, auditor_trace, human_required, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(100),

          supabase
            .from("consents")
            .select(
              "id, family_id, helper_id, status, granted_by, created_at, updated_at"
            )
            .order("updated_at", { ascending: false })
            .limit(100),

          supabase
            .from("applications")
            .select("id, application_type, status, created_at")
            .order("created_at", { ascending: false })
            .limit(100),
        ]);

      const firstError =
        auditResult.error ||
        aiResult.error ||
        consentResult.error ||
        appResult.error;

      if (firstError) {
        throw new Error(firstError.message);
      }

      setLogs((auditResult.data ?? []) as AuditLog[]);
      setDecisions((aiResult.data ?? []) as AIDecision[]);
      setConsents((consentResult.data ?? []) as Consent[]);
      setApplications((appResult.data ?? []) as Application[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load auditor data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredLogs = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return logs;

    return logs.filter((log) =>
      [
        log.actor_role,
        log.action,
        log.entity_table,
        log.entity_id,
        ...(log.changed_columns ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [logs, search]);

  const filteredDecisions = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return decisions;

    return decisions.filter((decision) =>
      [
        decision.application_id,
        decision.decision_type,
        decision.outcome,
        decision.model_name,
        decision.user_explanation,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [decisions, search]);

  const humanReviewCount = decisions.filter(
    (decision) => decision.human_required
  ).length;

  const revokedCount = consents.filter(
    (consent) => consent.status === "revoked"
  ).length;

  const stats = [
    {
      label: "Audit Events",
      value: logs.length,
      icon: Activity,
    },
    {
      label: "AI Decisions",
      value: decisions.length,
      icon: Brain,
    },
    {
      label: "Human Reviews",
      value: humanReviewCount,
      icon: AlertTriangle,
    },
    {
      label: "Revoked Consents",
      value: revokedCount,
      icon: ShieldCheck,
    },
  ];

  const tabs = [
    ["overview", "Overview"],
    ["audit", "Audit Logs"],
    ["ai", "AI Decisions"],
    ["consent", "Consent Records"],
    ["applications", "Applications"],
  ] as const;

  return (
    <DashboardShell role="auditor">
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              SATHI AI / Independent Oversight
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Auditor Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Read-only monitoring of system activity, AI decisions and consent.
            </p>
          </div>

          <button
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <strong>Could not load auditor data:</strong> {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b pb-3">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border p-10 text-center text-muted-foreground">
            Loading secure audit records...
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl border p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <Icon size={20} className="text-muted-foreground" />
                        </div>
                        <p className="mt-3 text-3xl font-bold">
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <section className="rounded-xl border p-5">
                  <h2 className="font-semibold">Oversight Summary</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm">
                      Total applications: <strong>{applications.length}</strong>
                    </p>
                    <p className="text-sm">
                      Consent records: <strong>{consents.length}</strong>
                    </p>
                    <p className="text-sm">
                      AI decisions requiring human review:{" "}
                      <strong>{humanReviewCount}</strong>
                    </p>
                    <p className="text-sm">
                      Revoked consents: <strong>{revokedCount}</strong>
                    </p>
                  </div>
                </section>

                <section className="rounded-xl border p-5">
                  <h2 className="font-semibold">Latest Audit Activity</h2>
                  <div className="mt-4 space-y-3">
                    {logs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {log.action ?? "System event"}
                          </p>
                          <p className="text-muted-foreground">
                            {log.actor_role ?? "Unknown role"} ·{" "}
                            {log.entity_table ?? "Unknown entity"}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No audit events found.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab !== "overview" && (
              <div className="relative">
                <div className="mb-4 flex items-center gap-2 rounded-lg border px-3">
                  <Search size={17} className="text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search records..."
                    className="w-full bg-transparent py-3 text-sm outline-none"
                  />
                </div>

                {activeTab === "audit" && (
                  <div className="space-y-3">
                    {filteredLogs.map((log) => (
                      <article key={log.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong>{log.action ?? "System event"}</strong>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Actor role: {log.actor_role ?? "Unknown"} · Entity:{" "}
                          {log.entity_table ?? "Unknown"}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          Entity ID: {log.entity_id ?? "Not recorded"}
                        </p>
                        <p className="mt-2 text-xs">
                          Changed fields:{" "}
                          {(log.changed_columns ?? []).join(", ") || "Not specified"}
                        </p>
                        {log.event_details && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm font-medium">
                              View event details
                            </summary>
                            <pre className="mt-2 overflow-auto rounded-lg bg-muted p-3 text-xs">
                              {JSON.stringify(log.event_details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </article>
                    ))}
                    {filteredLogs.length === 0 && (
                      <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
                        No matching audit events.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-3">
                    {filteredDecisions.map((decision) => (
                      <article key={decision.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong>{decision.outcome ?? "No outcome"}</strong>
                          <span className="text-xs text-muted-foreground">
                            {new Date(decision.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                          <p>Decision: {decision.decision_type ?? "N/A"}</p>
                          <p>Model: {decision.model_name ?? "N/A"}</p>
                          <p>
                            Confidence:{" "}
                            {decision.confidence == null
                              ? "Not recorded"
                              : `${(decision.confidence * 100).toFixed(1)}%`}
                          </p>
                          <p>
                            Human review: {decision.human_required ? "Required" : "Not required"}
                          </p>
                        </div>
                        <p className="mt-2 break-all text-xs text-muted-foreground">
                          Application: {decision.application_id ?? "Not linked"}
                        </p>
                        {decision.user_explanation && (
                          <p className="mt-3 text-sm">
                            {decision.user_explanation}
                          </p>
                        )}
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium">
                            View AI auditor trace
                          </summary>
                          <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-muted p-3 text-xs">
                            {JSON.stringify(decision.auditor_trace, null, 2)}
                          </pre>
                        </details>
                      </article>
                    ))}
                    {filteredDecisions.length === 0 && (
                      <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
                        No matching AI decisions.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "consent" && (
                  <div className="space-y-3">
                    {consents.map((consent) => (
                      <article key={consent.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong>Consent: {consent.status}</strong>
                          <span className="text-xs text-muted-foreground">
                            Updated: {new Date(consent.updated_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 break-all text-xs">
                          Family ID: {consent.family_id}
                        </p>
                        <p className="mt-1 break-all text-xs">
                          Helper ID: {consent.helper_id}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Consent ID: {consent.id}
                        </p>
                      </article>
                    ))}
                    {consents.length === 0 && (
                      <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
                        No consent records found.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "applications" && (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <article key={app.id} className="rounded-xl border p-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <strong>{app.application_type}</strong>
                          <span className="rounded-full border px-3 py-1 text-xs">
                            {app.status}
                          </span>
                        </div>
                        <p className="mt-2 break-all text-xs text-muted-foreground">
                          Application ID: {app.id}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Created: {new Date(app.created_at).toLocaleString()}
                        </p>
                      </article>
                    ))}
                    {applications.length === 0 && (
                      <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
                        No applications found.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 rounded-lg border p-3 text-xs text-muted-foreground">
          <ShieldCheck size={16} />
          Auditor access is read-only. All records are fetched using Supabase RLS.
        </div>
      </div>
    </DashboardShell>
  );
}

export const Route = createFileRoute("/auditor")({
  component: AuditorDashboard,
});
