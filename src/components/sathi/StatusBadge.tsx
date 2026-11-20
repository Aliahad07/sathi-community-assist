import { Badge } from "@/components/ui/badge";
import { statusMeta, type AppStatus } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: AppStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge variant={meta.variant}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {meta.label}
    </Badge>
  );
}

export function DemoBadge() {
  return <Badge variant="gold">Synthetic data</Badge>;
}
