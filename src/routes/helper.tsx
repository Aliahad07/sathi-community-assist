import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  Search,
  Users,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DashboardShell, type ShellNavItem } from "@/components/sathi/DashboardShell";
import { Section } from "@/components/sathi/Section";
import { StatCard } from "@/components/sathi/StatCard";
import { DemoBadge } from "@/components/sathi/StatusBadge";
import { Ur } from "@/components/sathi/Ur";
import {
  demoHelper,
  families,
  familyStatusMeta,
  helperTasks,
  type FamilyStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/helper")({
  head: () => ({
    meta: [
      { title: "Community helper dashboard — Sathi AI Prototype" },
      {
        name: "description",
        content: "Demo dashboard for community helpers supporting families with public service applications.",
      },
      { property: "og:title", content: "Community helper dashboard — Sathi AI Prototype" },
      {
        property: "og:description",
        content: "See how community helpers manage families and tasks in the Sathi AI demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelperDashboard,
});

const nav: ShellNavItem[] = [
  { id: "overview", label: "Overview", urdu: "جائزہ", icon: LayoutGrid },
  { id: "tasks", label: "Today's tasks", urdu: "آج کے کام", icon: ClipboardList },
  { id: "families", label: "Families", urdu: "خاندان", icon: UsersRound },
];

const filters: { id: FamilyStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_attention", label: "Needs attention" },
  { id: "new", label: "New" },
  { id: "on_track", label: "On track" },
];

function HelperDashboard() {
  const [tasks, setTasks] = useState(helperTasks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FamilyStatus | "all">("all");

  const visibleFamilies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter(
      (f) =>
        (filter === "all" || f.status === filter) &&
        (!q || f.head.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)),
    );
  }, [query, filter]);

  const totalMembers = families.reduce((sum, f) => sum + f.members, 0);
  const openCases = families.reduce((sum, f) => sum + f.openCases, 0);
  const pending = tasks.filter((t) => !t.done).length;

  return (
    <DashboardShell
      role="helper"
      userName={demoHelper.name}
      userMeta={`${demoHelper.area} · Demo`}
      nav={nav}
    >
      <section id="overview" className="scroll-mt-28 space-y-4">
        <div>
          <Ur className="text-lg text-accent-foreground">السلام علیکم</Ur>
          <h1 className="text-3xl font-semibold text-primary sm:text-4xl">
            Good evening, {demoHelper.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            You support {families.length} families in {demoHelper.area}. {pending} tasks are open.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Families" urdu="خاندان" value={families.length} icon={UsersRound} />
          <StatCard label="People" urdu="افراد" value={totalMembers} icon={Users} />
          <StatCard label="Open cases" urdu="زیرِ عمل کیس" value={openCases} icon={FolderKanban} />
          <StatCard label="Tasks left" urdu="باقی کام" value={pending} icon={CheckCircle2} />
        </div>
      </section>

      <Section
        id="tasks"
        title="Today's tasks"
        urdu="آج کے کام"
        description="Tick a task when it is done."
        action={<DemoBadge />}
      >
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors",
                  task.done ? "border-transparent bg-muted" : "bg-card hover:border-primary/40",
                )}
              >
                <Checkbox
                  checked={task.done}
                  onCheckedChange={(v) =>
                    setTasks((ts) =>
                      ts.map((t) => (t.id === task.id ? { ...t, done: v === true } : t)),
                    )
                  }
                  className="size-6"
                  aria-label={`Mark "${task.title}" as done`}
                />
                <span className="flex-1">
                  <span
                    className={cn(
                      "block font-semibold",
                      task.done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="text-sm text-muted-foreground">Family: {task.family}</span>
                </span>
                <Badge variant={task.due === "Today" && !task.done ? "warning" : "secondary"}>
                  {task.due}
                </Badge>
              </label>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="families" title="Families" urdu="خاندان" action={<DemoBadge />}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <label htmlFor="family-search" className="sr-only">
              Search families
            </label>
            <Input
              id="family-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or family ID"
              className="h-12 rounded-xl pl-12 text-base"
            />
          </div>
          <div className="scrollbar-none flex gap-2 overflow-x-auto" role="group" aria-label="Filter families">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "h-12 shrink-0 rounded-xl border-2 px-4 font-semibold transition-colors",
                  filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:border-primary/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visibleFamilies.map((f) => {
            const meta = familyStatusMeta[f.status];
            return (
              <article key={f.id} className="rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{f.head} family</p>
                    <p className="text-sm text-muted-foreground">
                      {f.id} · {f.location}
                    </p>
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center">
                  <div>
                    <dt className="text-xs text-muted-foreground">Members</dt>
                    <dd className="font-display text-2xl font-semibold text-primary">{f.members}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Open cases</dt>
                    <dd className="font-display text-2xl font-semibold text-primary">{f.openCases}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Last visit</dt>
                    <dd className="font-display text-2xl font-semibold text-primary">{f.lastVisit}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
          {visibleFamilies.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No families match your search.
            </p>
          )}
        </div>
      </Section>
    </DashboardShell>
  );
}
