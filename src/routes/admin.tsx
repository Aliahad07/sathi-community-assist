
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  RefreshCw,
  ShieldCheck,
  Users,
  FileText,
  Brain,
  ClipboardList,
} from "lucide-react";

import { DashboardShell } from "@/components/sathi/DashboardShell";
import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

type ApplicationRow = {
  id: string;
  application_type: string;
  description: string | null;
  status: string;
  created_at: string;
};

type AuditRow = {
  id: string;
  actor_role: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  created_at: string;
};

type AIDecisionRow = {
  id: string;
  application_id: string | null;
  outcome: string;
  confidence: number | null;
  human_required: boolean;
  user_explanation: string | null;
  created_at: string;
};

function AdminDashboard() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [aiDecisions, setAiDecisions] = useState<AIDecisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [userId, setUserId] = useState("");
  const [newRole, setNewRole] = useState("auditor");

  const [applicationId, setApplicationId] = useState("");
  const [officerId, setOfficerId] = useState("");

  const [ruleKey, setRuleKey] = useState("");
  const [rulePayload, setRulePayload] = useState(
    '{\n  "minimum_age": 18,\n  "requires_human_review": true\n}',
  );
  const [ruleReason, setRuleReason] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const supabase = getSupabase();

      const [appsResult, auditResult, aiResult] = await Promise.all([
        supabase
          .from("applications")
          .select("id, application_type, description, status, created_at")
          .order("created_at", { ascending: false })
          .limit(50),

        supabase
          .from("audit_logs")
          .select("id, actor_role, action, entity_table, entity_id, created_at")
          .order("created_at", { ascending: false })
          .limit(30),

        supabase
          .from("ai_decisions")
          .select(
            "id, application_id, outcome, confidence, human_required, user_explanation, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (appsResult.error) {
        console.error("Applications load error:", appsResult.error);
        toast.error("Could not load applications. Check Admin SELECT permissions.");
      } else {
        setApplications((appsResult.data ?? []) as ApplicationRow[]);
      }

      if (auditResult.error) {
        console.error("Audit logs load error:", auditResult.error);
        toast.error("Could not load audit logs.");
      } else {
        setAuditLogs((auditResult.data ?? []) as AuditRow[]);
      }

      if (aiResult.error) {
        console.error("AI decisions load error:", aiResult.error);
        toast.error("Could not load AI decisions.");
      } else {
        setAiDecisions((aiResult.data ?? []) as AIDecisionRow[]);
      }
    } catch (error) {
      console.error("Admin dashboard error:", error);
      toast.error("Unable to load Admin Dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleRoleChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId.trim()) {
      toast.error("Enter the user's Supabase UUID.");
      return;
    }

    setBusy(true);

    try {
      const { data, error } = await getSupabase().rpc("admin_set_user_role", {
        p_user_id: userId.trim(),
        p_new_role: newRole,
      });

      if (error) throw error;

      toast.success(`User role updated to ${newRole}.`);
      console.log("Role update result:", data);
      setUserId("");
    } catch (error) {
      console.error("Role assignment error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Role update failed. Make sure you are logged in as Admin.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleAssignApplication(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!applicationId.trim() || !officerId.trim()) {
      toast.error("Enter both Application UUID and Officer UUID.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await getSupabase().rpc("assign_application", {
        p_application_id: applicationId.trim(),
        p_officer_id: officerId.trim(),
      });

      if (error) throw error;

      toast.success("Application assigned to Officer.");
      setApplicationId("");
      setOfficerId("");
      await loadDashboard();
    } catch (error) {
      console.error("Application assignment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Assignment failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePublishRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ruleKey.trim() || !ruleReason.trim()) {
      toast.error("Enter a rule key and change reason.");
      return;
    }

    let parsedPayload: unknown;

    try {
      parsedPayload = JSON.parse(rulePayload);
    } catch {
      toast.error("Rule payload must be valid JSON.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await getSupabase().rpc("publish_eligibility_rule", {
        p_rule_key: ruleKey.trim(),
        p_rule_payload: parsedPayload,
        p_change_reason: ruleReason.trim(),
      });

      if (error) throw error;

      toast.success("Eligibility rule published with a new version.");
      setRuleKey("");
      setRuleReason("");
    } catch (error) {
      console.error("Rule publishing error:", error);
      toast.error(
        error instanceof Error ? error.message : "Rule publishing failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  const pendingCount = applications.filter(
    (item) => item.status === "pending" || item.status === "under_review",
  ).length;

  const humanReviewCount = aiDecisions.filter(
    (item) => item.human_required,
  ).length;

  return (
    <DashboardShell role="admin">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">SATHI AI</p>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage platform access, applications, rules and oversight.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh data
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Applications loaded"
            value={applications.length}
          />
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="Pending / in review"
            value={pendingCount}
          />
          <StatCard
            icon={<Brain className="h-5 w-5" />}
            label="AI decisions loaded"
            value={aiDecisions.length}
          />
          <StatCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Require human review"
            value={humanReviewCount}
          />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel
            icon={<Users className="h-5 w-5" />}
            title="User Role Management"
            description="Assign a role to an existing Supabase user using the secure Admin RPC."
          >
            <form onSubmit={handleRoleChange} className="space-y-3">
              <FieldLabel>User UUID</FieldLabel>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Paste Supabase user UUID"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />

              <FieldLabel>New role</FieldLabel>
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="citizen">Citizen</option>
                <option value="helper">Community Helper</option>
                <option value="officer">Department Officer</option>
                <option value="auditor">Auditor</option>
                <option value="admin">Admin</option>
              </select>

              <button className="primary-button" disabled={busy}>
                {busy ? "Processing..." : "Update user role"}
              </button>
            </form>
          </Panel>

          <Panel
            icon={<ClipboardList className="h-5 w-5" />}
            title="Assign Application"
            description="Assign a case to an existing Officer account."
          >
            <form onSubmit={handleAssignApplication} className="space-y-3">
              <FieldLabel>Application UUID</FieldLabel>
              <input
                value={applicationId}
                onChange={(event) => setApplicationId(event.target.value)}
                placeholder="Paste application UUID"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />

              <FieldLabel>Officer UUID</FieldLabel>
              <input
                value={officerId}
                onChange={(event) => setOfficerId(event.target.value)}
                placeholder="Paste Officer profile UUID"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />

              <button className="primary-button" disabled={busy}>
                {busy ? "Processing..." : "Assign case"}
              </button>
            </form>
          </Panel>
        </section>

        <Panel
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Eligibility Rules Editor"
          description="Publish a new version of a rule without redeploying the application."
        >
          <form onSubmit={handlePublishRule} className="space-y-3">
            <FieldLabel>Rule key</FieldLabel>
            <input
              value={ruleKey}
              onChange={(event) => setRuleKey(event.target.value)}
              placeholder="e.g. financial_assistance"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />

            <FieldLabel>Rule payload (JSON)</FieldLabel>
            <textarea
              value={rulePayload}
              onChange={(event) => setRulePayload(event.target.value)}
              rows={5}
              className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm"
              required
            />

            <FieldLabel>Reason for change</FieldLabel>
            <input
              value={ruleReason}
              onChange={(event) => setRuleReason(event.target.value)}
              placeholder="Explain why this rule is changing"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />

            <button className="primary-button" disabled={busy}>
              {busy ? "Publishing..." : "Publish new rule version"}
            </button>
          </form>
        </Panel>

        <Panel
          icon={<FileText className="h-5 w-5" />}
          title="Applications"
          description="Latest application records visible to the Admin account."
        >
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications returned. If records exist, check the Admin SELECT
              policy on the applications table.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{item.application_type}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {item.id}
                  </p>
                  <p className="mt-2 text-sm">
                    {item.description || "No description provided."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel
            icon={<Brain className="h-5 w-5" />}
            title="AI Decision Monitor"
            description="Review AI outcomes, confidence and human handoff flags."
          >
            {aiDecisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No AI decisions returned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {aiDecisions.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="font-medium capitalize">
                      {item.outcome.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground break-all">
                      Application: {item.application_id ?? "Not linked"}
                    </p>
                    <p className="mt-1 text-sm">
                      Confidence:{" "}
                      {item.confidence == null
                        ? "Not provided"
                        : `${(item.confidence * 100).toFixed(1)}%`}
                    </p>
                    <p className="text-sm">
                      Human review: {item.human_required ? "Required" : "Not flagged"}
                    </p>
                    {item.user_explanation && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.user_explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            icon={<Activity className="h-5 w-5" />}
            title="Recent Audit Logs"
            description="Recent recorded actions across the platform."
          >
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No audit logs returned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="font-medium">
                      {item.action} · {item.entity_table}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Role: {item.actor_role ?? "Unknown"}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      Record: {item.entity_id ?? "Not specified"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        <p className="text-xs text-muted-foreground">
          SATHI AI hackathon prototype. All service and identity integrations
          must be treated as simulated unless explicitly connected and verified.
        </p>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{children}</label>;
}
