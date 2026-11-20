import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FlaskConical, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/sathi/Logo";
import { PrototypeBanner } from "@/components/sathi/PrototypeBanner";
import { Ur } from "@/components/sathi/Ur";
import { roles, type RoleId } from "@/lib/roles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Demo sign in — Sathi AI Prototype" },
      {
        name: "description",
        content: "Choose a demo role to explore the Sathi AI prototype. No real account needed.",
      },
      { property: "og:title", content: "Demo sign in — Sathi AI Prototype" },
      {
        property: "og:description",
        content: "Pick Citizen, Community Helper or Officer to explore the Sathi AI demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RoleId>("citizen");
  const current = roles.find((r) => r.id === selected);

  function handleContinue() {
    if (current?.path) navigate({ to: current.path });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PrototypeBanner />
      <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-gradient-navy p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="bg-pattern-grid absolute inset-0" aria-hidden />
          <Logo tone="light" className="relative" />
          <div className="relative">
            <h1 className="text-4xl font-semibold leading-tight">
              Welcome to Sathi.
              <br />
              <span className="text-gradient-gold">Pick a role to explore.</span>
            </h1>
            <Ur className="mt-4 block text-2xl text-primary-foreground/80">
              ساتھی میں خوش آمدید
            </Ur>
            <ul className="mt-8 space-y-3 text-primary-foreground/80">
              {[
                "No password — this is a demo sign in",
                "Every name and record is synthetic",
                "No government system is connected",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-gold text-gold-foreground">
                    <Check className="size-4" aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-sm text-primary-foreground/50">
            Hackathon prototype · Not an official service
          </p>
        </aside>

        {/* Role selection */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-xl">
            <Logo className="mb-8 lg:hidden" />
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-accent-foreground">
              <FlaskConical className="size-4" aria-hidden />
              Demo sign in
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-primary sm:text-4xl">
              Choose your role
            </h2>
            <Ur className="text-xl text-muted-foreground">اپنا کردار منتخب کریں</Ur>

            <div role="radiogroup" aria-label="Demo role" className="mt-8 grid gap-3">
              {roles.map((role) => {
                const disabled = role.path === null;
                const active = selected === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={disabled}
                    onClick={() => setSelected(role.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-all sm:p-5",
                      active
                        ? "border-primary shadow-card"
                        : "border-border hover:border-primary/40",
                      disabled && "cursor-not-allowed opacity-60 hover:border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-xl",
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                      )}
                    >
                      <role.icon className="size-6" aria-hidden />
                    </span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-lg font-semibold text-foreground">{role.label}</span>
                        <Ur className="text-sm text-muted-foreground">{role.urdu}</Ur>
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {role.description}
                      </span>
                    </span>
                    {disabled ? (
                      <Lock className="size-5 text-muted-foreground" aria-label="Not available yet" />
                    ) : (
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full border-2",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                        aria-hidden
                      >
                        {active && <Check className="size-4" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Button size="xl" className="mt-8 w-full" onClick={handleContinue}>
              Continue as {current?.label}
              <ArrowRight />
            </Button>
            <p className="mt-2 text-center">
              <Ur className="text-base text-muted-foreground">جاری رکھیں</Ur>
            </p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Demo only. No personal information is collected or stored.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
