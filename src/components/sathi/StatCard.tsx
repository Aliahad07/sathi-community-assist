import type { LucideIcon } from "lucide-react";
import { Ur } from "./Ur";

export function StatCard({
  label,
  urdu,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  urdu: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <Ur className="text-xs text-muted-foreground">{urdu}</Ur>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 font-display text-4xl font-semibold text-primary">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
