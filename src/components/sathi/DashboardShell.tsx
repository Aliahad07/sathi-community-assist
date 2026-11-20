import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, type LucideIcon } from "lucide-react";

import { Logo } from "./Logo";
import { PrototypeBanner } from "./PrototypeBanner";
import { Ur } from "./Ur";
import { getRole, type RoleId } from "@/lib/roles";

export interface ShellNavItem {
  id: string;
  label: string;
  urdu: string;
  icon: LucideIcon;
}

export function DashboardShell({
  role,
  userName,
  userMeta,
  nav,
  children,
}: {
  role: RoleId;
  userName: string;
  userMeta: string;
  nav: ShellNavItem[];
  children: ReactNode;
}) {
  const info = getRole(role);
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40">
        <PrototypeBanner />
        <header className="bg-gradient-navy text-primary-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-4">
              <Logo tone="light" />
              <span className="hidden h-8 w-px bg-primary-foreground/20 sm:block" aria-hidden />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{info.label} dashboard</p>
                <Ur className="text-xs text-primary-foreground/70">{info.urdu}</Ur>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-primary-foreground/70">{userMeta}</p>
              </div>
              <span
                className="grid size-10 place-items-center rounded-full bg-gold text-sm font-bold text-gold-foreground"
                aria-hidden
              >
                {initials}
              </span>
              <Link
                to="/login"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary-foreground/25 px-3 text-sm font-semibold hover:bg-primary-foreground/10"
              >
                <ArrowLeftRight className="size-4" aria-hidden />
                <span className="hidden sm:inline">Switch role</span>
                <span className="sr-only sm:hidden">Switch role</span>
              </Link>
            </div>
          </div>
          {/* Mobile section nav */}
          <nav
            aria-label="Dashboard sections"
            className="scrollbar-none flex gap-2 overflow-x-auto border-t border-primary-foreground/10 px-4 py-2 lg:hidden"
          >
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/20"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </a>
            ))}
          </nav>
        </header>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:py-8">
        <aside className="hidden lg:block">
          <nav
            aria-label="Dashboard sections"
            className="sticky top-32 space-y-1 rounded-3xl border bg-card p-3 shadow-card"
          >
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-foreground transition-colors hover:bg-secondary"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold">{item.label}</span>
                  <Ur className="text-xs text-muted-foreground">{item.urdu}</Ur>
                </span>
              </a>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
