import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HandHeart,
  Inbox,
  LayoutGrid,
  ListChecks,
  RotateCcw,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardShell, type ShellNavItem } from "@/components/sathi/DashboardShell";
import { Section } from "@/components/sathi/Section";
import { StatCard } from "@/components/sathi/StatCard";
import { DemoBadge, StatusBadge } from "@/components/sathi/StatusBadge";
import { Ur } from "@/components/sathi/Ur";
import {
  demoOfficer,
  statusMeta,
  weeklyVolume,
  type AppStatus,
  type DemoApplication,
} from "@/lib/mock-data";
import { demoActions, useDemoStore } from "@/lib/demo-store";
import { formatDateTime, isOpenForDecision } from "@/lib/demo-workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/officer")({
  head: () => ({
    meta: [
      { title: "Officer dashboard — Sathi AI Prototype" },
      {
        name: "description",
        content: "Demo dashboard for department officers reviewing citizen applications.",
      },
      { property: "og:title", content: "Officer dashboard — Sathi AI Prototype" },
      {
        property: "og:description",
        content: "See how officers review and decide applications in the Sathi AI demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfficerDashboard,
});

const nav: ShellNavItem[] = [
  { id: "overview", label: "Overview", urdu: "جائزہ", icon: LayoutGrid },
  { id: "queue", label: "Application queue", urdu: "درخواستوں کی قطار", icon: ListChecks },
  { id: "activity", label: "Weekly activity", urdu: "ہفتہ وار سرگرمی", icon: BarChart3 },
];

type Filter = AppStatus | "all";
const filterOrder: Filter[] = ["all", "doc_pending", "submitted", "in_review", "approved", "returned"];

function OfficerDashboard() {
  const { applications } = useDemoStore();
  const queue = useMemo(() => applications.filter((a) => a.inOfficerQueue), [applications]);
  const [filter, setFilter] = useState<Filter>("all");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const details = queue.find((q) => q.id === detailsId);
  const returning = queue.find((q) => q.id === returnId);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: queue.length, submitted: 0, in_review: 0, approved: 0, returned: 0, doc_pending: 0 };
    queue.forEach((q) => (c[q.status] += 1));
    return c;
  }, [queue]);

  const visible = filter === "all" ? queue : queue.filter((q) => q.status === filter);
  const maxVolume = Math.max(...weeklyVolume.map((d) => d.count));

  function approve(id: string) {
    demoActions.approve(id);
    toast.success(`${id} marked as approved`, {
      description: "Demo action — saved in this browser only, nothing is sent to any real system.",
    });
  }

  function confirmReturn(id: string, reason: string) {
    demoActions.returnWithReason(id, reason);
    setReturnId(null);
    toast.success(`${id} returned to the applicant`, {
      description: "Demo action — your reason is shown on the citizen dashboard.",
    });
  }

  return (
    <DashboardShell
      role="officer"
      userName={demoOfficer.name}
      userMeta={`${demoOfficer.title} · Demo`}
      nav={nav}
    >
      <section id="overview" className="scroll-mt-28 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-foreground">
              {demoOfficer.department}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-primary sm:text-4xl">
              Review desk
            </h1>
            <Ur className="text-lg text-muted-foreground">جائزہ ڈیسک</Ur>
          </div>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="New" urdu="نئی" value={counts.submitted} icon={Inbox} hint="Waiting to be opened" />
          <StatCard label="In review" urdu="زیرِ جائزہ" value={counts.in_review} icon={Clock} />
          <StatCard label="Approved" urdu="منظور شدہ" value={counts.approved} icon={CheckCircle2} />
          <StatCard label="Avg. decision" urdu="اوسط وقت" value="4.2d" icon={Timer} hint="Demo figure" />
        </div>
      </section>

      <Section
        id="queue"
        title="Application queue"
        urdu="درخواستوں کی قطار"
        description="Open, approve or return applications. Decisions are saved in this browser for the demo."
      >
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by status">
          {filterOrder.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border-2 px-4 font-semibold transition-colors",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:border-primary/40",
              )}
            >
              {f === "all" ? "All" : statusMeta[f].label}
              <span
                className={cn(
                  "rounded-full px-2 text-sm",
                  filter === f ? "bg-primary-foreground/20" : "bg-secondary",
                )}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <ul className="mt-5 space-y-3">
          {visible.map((item) => {
            const open = isOpenForDecision(item.status);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border p-4 sm:p-5 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{item.id}</span>
                    {item.priority === "high" && <Badge variant="gold">High priority</Badge>}
                    {item.viaHelper && (
                      <Badge variant="info">
                        <HandHeart className="size-3.5" aria-hidden />
                        Via helper
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">{item.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.applicant} · {item.area} · Submitted {item.submitted}
                  </p>
                  {item.submission && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <FileText className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate font-medium">{item.submission.fileName}</span>
                      <span className="shrink-0 text-muted-foreground">
                        · {formatDateTime(item.submission.uploadedAt)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailsId(item.id)}
                    aria-label={`View details for ${item.id}`}
                  >
                    <Eye />
                    Details
                  </Button>
                  {open && (
                    <>
                      <Button size="sm" variant="success" onClick={() => approve(item.id)}>
                        <CheckCircle2 />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReturnId(item.id)}>
                        <RotateCcw />
                        Return
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No applications with this status.
            </li>
          )}
        </ul>
      </Section>

      <Section
        id="activity"
        title="Weekly activity"
        urdu="ہفتہ وار سرگرمی"
        description="Applications received this week (synthetic)."
      >
        <div className="flex h-56 items-end gap-3 sm:gap-5" role="img" aria-label="Bar chart of applications per day">
          {weeklyVolume.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-sm font-semibold text-primary">{d.count}</span>
              <div
                className="w-full rounded-t-xl bg-primary transition-all hover:bg-gold"
                style={{ height: `${(d.count / maxVolume) * 160}px` }}
              />
              <span className="text-sm text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </Section>

      <DetailsDialog
        app={details}
        onClose={() => setDetailsId(null)}
        onApprove={(id) => {
          approve(id);
          setDetailsId(null);
        }}
        onReturn={(id) => {
          setDetailsId(null);
          setReturnId(id);
        }}
      />
      <ReturnDialog app={returning} onClose={() => setReturnId(null)} onConfirm={confirmReturn} />
    </DashboardShell>
  );
}

function DetailsDialog({
  app,
  onClose,
  onApprove,
  onReturn,
}: {
  app: DemoApplication | undefined;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReturn: (id: string) => void;
}) {
  const rows: [string, string][] = app
    ? [
        ["Application ID", app.id],
        ["Applicant", app.applicant],
        ["Service", app.service],
        ["Department", app.department],
        ["Area", app.area],
        ["Submitted", app.submitted],
        ["Priority", app.priority === "high" ? "High" : "Normal"],
        ["Submitted via", app.viaHelper ? "Community helper" : "Citizen"],
      ]
    : [];
  return (
    <Dialog open={app !== undefined} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {app && (
          <>
            <DialogHeader>
              <DialogTitle>{app.service}</DialogTitle>
              <DialogDescription>
                <Ur className="block">درخواست کی تفصیل</Ur>
                Synthetic demo record — not a real applicant.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <StatusBadge status={app.status} />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl bg-muted p-4 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl border p-4 text-sm">
              <p className="font-semibold text-foreground">Document</p>
              {app.submission ? (
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium text-foreground">{app.submission.fileName}</span>{" "}
                  · uploaded {formatDateTime(app.submission.uploadedAt)}. Demo only — the file
                  itself was not sent or stored.
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">No new document uploaded in this demo.</p>
              )}
            </div>
            {app.decision && (
              <div className="rounded-xl border p-4 text-sm">
                <p className="font-semibold text-foreground">Last decision</p>
                <p className="mt-1 text-muted-foreground">
                  {app.decision.outcome === "approved" ? "Approved" : "Returned"} by{" "}
                  {app.decision.officer} · {formatDateTime(app.decision.decidedAt)}
                </p>
                {app.decision.reason && (
                  <p className="mt-1 text-foreground">Reason: {app.decision.reason}</p>
                )}
              </div>
            )}
            {isOpenForDecision(app.status) && (
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => onReturn(app.id)}>
                  <RotateCcw />
                  Return
                </Button>
                <Button variant="success" onClick={() => onApprove(app.id)}>
                  <CheckCircle2 />
                  Approve
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReturnDialog({
  app,
  onClose,
  onConfirm,
}: {
  app: DemoApplication | undefined;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const missing = reason.trim().length === 0;

  function close() {
    setReason("");
    setTouched(false);
    onClose();
  }

  return (
    <Dialog open={app !== undefined} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        {app && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
              if (missing) return;
              onConfirm(app.id, reason);
              setReason("");
              setTouched(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Return {app.id}</DialogTitle>
              <DialogDescription>
                <Ur className="block">واپسی کی وجہ لکھیں</Ur>
                Tell the applicant what to fix. They will see this reason on their dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason for returning (required)</Label>
              <Textarea
                id="return-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={touched && missing}
                aria-describedby="return-reason-error"
                rows={4}
                placeholder="e.g. The bill photo is blurry. Please upload a clearer copy."
                className="text-base"
              />
              {touched && missing && (
                <p id="return-reason-error" className="text-sm font-medium text-destructive">
                  Please write a reason before returning.
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                <RotateCcw />
                Return application
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
