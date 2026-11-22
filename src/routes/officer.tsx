
import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LayoutGrid,
  ListChecks,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardShell, type ShellNavItem } from "@/components/sathi/DashboardShell";
import { Section } from "@/components/sathi/Section";

import { getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/officer")({
  head: () => ({
    meta: [
      { title: "Officer Dashboard — SATHI AI" },
      {
        name: "description",
        content: "Real application review dashboard for SATHI AI.",
      },
    ],
  }),
  component: OfficerDashboard,
});

interface OfficerCase {
  application_id: string;
  family_id: string;
  family_name: string;
  application_type: string;
  description: string;
  application_status: string;
  application_created_at: string;
  assignment_id: string;
  assigned_at: string;
  ai_outcome: string | null;
  ai_confidence: number | null;
  ai_human_required: boolean | null;
  ai_explanation: string | null;
}

const nav: ShellNavItem[] = [
  { id: "overview", label: "Overview", urdu: "جائزہ", icon: LayoutGrid },
  { id: "queue", label: "Application queue", urdu: "درخواستوں کی قطار", icon: ListChecks },
  { id: "activity", label: "Review information", urdu: "جائزے کی معلومات", icon: Activity },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatConfidence(value: number | null) {
  if (value === null || value === undefined) return "Not available";
  const percent = value <= 1 ? value * 100 : value;
  return `${Math.round(percent)}%`;
}

function OfficerDashboard() {
  const [cases, setCases] = useState<OfficerCase[]>([]);
  const [officerName, setOfficerName] = useState("Department Officer");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadCases = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const supabase = getSupabase();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "officer") {
        throw new Error("Officer access is required.");
      }

      setOfficerName(profile.full_name || "Department Officer");

      const { data, error: queueError } = await supabase.rpc(
        "get_officer_case_queue"
      );

      if (queueError) throw queueError;

      setCases((data ?? []) as OfficerCase[]);
    } catch (err) {
      console.error("Officer queue error:", err);
      const message =
        err instanceof Error ? err.message : "Unable to load officer queue.";
      setError(message);
      if (silent) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const counts = useMemo(() => {
    return {
      all: cases.length,
      pending: cases.filter((c) => c.application_status === "pending").length,
      under_review: cases.filter(
        (c) => c.application_status === "under_review"
      ).length,
      approved: cases.filter((c) => c.application_status === "approved").length,
      rejected: cases.filter((c) => c.application_status === "rejected").length,
    };
  }, [cases]);

  const visibleCases = useMemo(() => {
    if (filter === "all") return cases;
    return cases.filter((c) => c.application_status === filter);
  }, [cases, filter]);

  const selectedCase = cases.find(
    (c) => c.application_id === selectedId
  );

  async function changeStatus(
    item: OfficerCase,
    newStatus: "under_review" | "approved" | "rejected"
  ) {
    const cleanReason = reason.trim();

    if (cleanReason.length < 5) {
      toast.error("Please enter a meaningful reason (at least 5 characters).");
      return;
    }

    setProcessingId(item.application_id);

    try {
      const supabase = getSupabase();

      const { error: rpcError } = await supabase.rpc(
        "transition_application",
        {
          p_application_id: item.application_id,
          p_new_status: newStatus,
          p_reason: cleanReason,
        }
      );

      if (rpcError) throw rpcError;

      const labels: Record<string, string> = {
        under_review: "Application moved to review.",
        approved: "Application approved.",
        rejected: "Application rejected.",
      };

      toast.success(labels[newStatus]);
      setReason("");
      setSelectedId(null);
      await loadCases(true);
    } catch (err) {
      console.error("Application transition error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to update application."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <DashboardShell
      role="officer"
      userName={officerName}
      userMeta="Authenticated department officer"
      nav={nav}
    >
      <section id="overview" className="scroll-mt-28 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent-foreground">
              Department Review
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-primary sm:text-4xl">
              Officer Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review and process your assigned citizen applications.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => void loadCases(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            Refresh queue
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Assigned cases"
            value={counts.all}
            icon={<ListChecks />}
          />
          <Stat
            label="Pending"
            value={counts.pending}
            icon={<Clock />}
          />
          <Stat
            label="Under review"
            value={counts.under_review}
            icon={<Eye />}
          />
          <Stat
            label="Approved"
            value={counts.approved}
            icon={<CheckCircle2 />}
          />
        </div>
      </section>

      <Section
        id="queue"
        title="Assigned application queue"
        urdu="درخواستوں کی قطار"
        description="Only applications assigned to your authenticated officer account are shown."
      >
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "under_review", "approved", "rejected"].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  filter === status
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:border-primary"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.replace("_", " ").replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    )}
                {" "}
                ({counts[status as keyof typeof counts]})
              </button>
            )
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold text-destructive">
              <AlertTriangle className="size-4" />
              Unable to load officer queue
            </div>
            <p className="mt-1 text-foreground">{error}</p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => void loadCases()}
            >
              Try again
            </Button>
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-muted-foreground">
            Loading assigned applications...
          </p>
        ) : visibleCases.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <FileText className="mx-auto mb-3 size-9 text-muted-foreground" />
            <p className="font-semibold">No applications found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no assigned applications matching this filter.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {visibleCases.map((item) => (
              <li
                key={item.application_id}
                className="rounded-2xl border bg-card p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-xs text-muted-foreground">
                      {item.application_id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">
                      {item.application_type}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Family: {item.family_name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitted: {formatDate(item.application_created_at)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    item.application_status === "approved"
      ? "bg-green-100 text-green-800"
      : item.application_status === "rejected"
        ? "bg-red-100 text-red-800"
        : item.application_status === "under_review"
          ? "bg-blue-100 text-blue-800"
          : "bg-amber-100 text-amber-800"
  }`}
>
  {item.application_status.replace("_", " ").toUpperCase()}
</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedId(item.application_id)
                      }
                    >
                      <Eye />
                      Details
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="activity"
        title="Review information"
        urdu="جائزے کی معلومات"
        description="AI provides decision support. Final benefit decisions remain with authorized human officers."
      >
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5 text-primary" />
            Human oversight enabled
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Every status change requires a reason and is processed through the
            secure backend workflow, which records an audit entry.
          </p>
        </div>
      </Section>

      {selectedCase && (
        <section className="rounded-2xl border-2 border-primary/20 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Application details</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedId(null);
                setReason("");
              }}
            >
              Close
            </Button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <Detail label="Application ID" value={selectedCase.application_id} />
            <Detail label="Family" value={selectedCase.family_name} />
            <Detail label="Application type" value={selectedCase.application_type} />
            <Detail
              label="Submitted"
              value={formatDate(selectedCase.application_created_at)}
            />
            <Detail
              label="Current status"
              value={selectedCase.application_status}
            />
          </div>

          <div className="mt-4 rounded-xl bg-muted p-4">
            <p className="font-semibold">Applicant description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {selectedCase.description || "No description provided."}
            </p>
          </div>

          <div className="mt-4 rounded-xl border p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Activity className="size-4" />
              AI decision support
            </div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <Detail
                label="AI recommendation"
                value={selectedCase.ai_outcome || "Not evaluated"}
              />
              <Detail
                label="AI confidence"
                value={formatConfidence(selectedCase.ai_confidence)}
              />
              <Detail
                label="Human review required"
                value={
                  selectedCase.ai_human_required === null
                    ? "Not available"
                    : selectedCase.ai_human_required
                      ? "Yes"
                      : "No"
                }
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {selectedCase.ai_explanation ||
                "No AI explanation is available for this application yet."}
            </p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              AI output is advisory only. It does not approve or reject benefits.
            </p>
          </div>

          {selectedCase.application_status !== "approved" &&
            selectedCase.application_status !== "rejected" &&
            selectedCase.application_status !== "completed" && (
              <div className="mt-5 space-y-3">
                <Label htmlFor="officer-reason">
                  Reason for this action (required)
                </Label>
                <Textarea
                  id="officer-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the reason for your status change..."
                  rows={3}
                />

                <div className="flex flex-wrap gap-2">
                  {selectedCase.application_status === "pending" && (
                    <Button
                      onClick={() =>
                        void changeStatus(selectedCase, "under_review")
                      }
                      disabled={processingId === selectedCase.application_id}
                    >
                      <Eye />
                      Start review
                    </Button>
                  )}

                  {selectedCase.application_status === "under_review" && (
                    <>
                      <Button
                        variant="success"
                        onClick={() =>
                          void changeStatus(selectedCase, "approved")
                        }
                        disabled={processingId === selectedCase.application_id}
                      >
                        <CheckCircle2 />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          void changeStatus(selectedCase, "rejected")
                        }
                        disabled={processingId === selectedCase.application_id}
                      >
                        <RotateCcw />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
        </section>
      )}
    </DashboardShell>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-2 last:border-0 sm:grid-cols-[150px_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words font-medium">{value}</span>
    </div>
  );
}
