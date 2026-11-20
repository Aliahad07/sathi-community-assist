import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Clock,
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
import { DashboardShell, type ShellNavItem } from "@/components/sathi/DashboardShell";
import { Section } from "@/components/sathi/Section";
import { StatCard } from "@/components/sathi/StatCard";
import { DemoBadge, StatusBadge } from "@/components/sathi/StatusBadge";
import { Ur } from "@/components/sathi/Ur";
import {
  demoOfficer,
  officerQueue,
  statusMeta,
  weeklyVolume,
  type AppStatus,
} from "@/lib/mock-data";
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
const filterOrder: Filter[] = ["all", "submitted", "in_review", "approved", "returned"];

function OfficerDashboard() {
  const [queue, setQueue] = useState(officerQueue);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: queue.length, submitted: 0, in_review: 0, approved: 0, returned: 0 };
    queue.forEach((q) => (c[q.status] += 1));
    return c;
  }, [queue]);

  const visible = filter === "all" ? queue : queue.filter((q) => q.status === filter);
  const maxVolume = Math.max(...weeklyVolume.map((d) => d.count));

  function decide(id: string, status: AppStatus) {
    setQueue((qs) => qs.map((q) => (q.id === id ? { ...q, status } : q)));
    toast.success(`${id} marked as ${statusMeta[status].label.toLowerCase()}`, {
      description: "Demo action — nothing is sent to any real system.",
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
        description="Approve or return applications. Changes stay on this page only."
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
            const open = item.status === "submitted" || item.status === "in_review";
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
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  {open && (
                    <>
                      <Button size="sm" variant="success" onClick={() => decide(item.id, "approved")}>
                        <CheckCircle2 />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide(item.id, "returned")}>
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
    </DashboardShell>
  );
}
