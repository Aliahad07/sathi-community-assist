import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-10 place-items-center rounded-xl bg-gradient-gold font-display text-xl font-bold text-gold-foreground shadow-gold",
        className,
      )}
    >
      S
    </span>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="Sathi AI home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-semibold",
            tone === "light" ? "text-primary-foreground" : "text-primary",
          )}
        >
          Sathi <span className="text-gold">AI</span>
        </span>
        <span
          className={cn(
            "mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]",
            tone === "light" ? "text-primary-foreground/60" : "text-muted-foreground",
          )}
        >
          Prototype
        </span>
      </span>
    </Link>
  );
}
