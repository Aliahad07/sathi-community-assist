import type { ReactNode } from "react";
import { Ur } from "./Ur";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  urdu,
  description,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  urdu: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-28 rounded-3xl border bg-card p-5 shadow-card sm:p-7", className)}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 id={`${id}-title`} className="text-2xl font-semibold text-primary">
              {title}
            </h2>
            <Ur className="text-base text-muted-foreground">{urdu}</Ur>
          </div>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
