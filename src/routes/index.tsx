import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  Languages,
  MessageCircleHeart,
  Mic,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/sathi/Logo";
import { PrototypeBanner } from "@/components/sathi/PrototypeBanner";
import { Ur } from "@/components/sathi/Ur";
import { roles } from "@/lib/roles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sathi AI — Your digital helper for public services (Prototype)" },
      {
        name: "description",
        content:
          "Sathi AI helps citizens, community helpers and officers in Pakistan with public services in simple English and Urdu. Hackathon prototype with demo data.",
      },
      { property: "og:title", content: "Sathi AI — Your digital helper for public services" },
      {
        property: "og:description",
        content: "A bilingual public assistance prototype for Pakistan, built with synthetic demo data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: MessageCircleHeart,
    title: "Ask in your own words",
    urdu: "اپنی زبان میں پوچھیں",
    text: "Type or speak in simple English or Urdu. Sathi explains what you need.",
  },
  {
    icon: FileCheck2,
    title: "Apply with guidance",
    urdu: "رہنمائی کے ساتھ درخواست",
    text: "Step-by-step help with forms and documents, or support from a community helper.",
  },
  {
    icon: CheckCircle2,
    title: "Track until done",
    urdu: "مکمل ہونے تک خبر رکھیں",
    text: "See where your request is, and what to do if an officer needs more information.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PrototypeBanner />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-navy text-primary-foreground">
        <div className="bg-pattern-grid absolute inset-0" aria-hidden />
        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo tone="light" />
          <Button asChild variant="outline-light">
            <Link to="/login">
              Demo sign in
              <ArrowRight />
            </Link>
          </Button>
        </header>

        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-primary-foreground/5 px-4 py-1.5 text-sm font-semibold text-gold">
              <FlaskConical className="size-4" aria-hidden />
              Hackathon prototype
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Public services, explained simply.{" "}
              <span className="text-gradient-gold">With a helper by your side.</span>
            </h1>
            <Ur className="mt-5 block text-2xl text-primary-foreground/85 sm:text-3xl">
              سرکاری خدمات کے لیے آپ کا ڈیجیٹل ساتھی
            </Ur>
            <p className="mt-4 max-w-xl text-lg text-primary-foreground/75">
              Sathi AI guides citizens through applications in plain language, lets community
              helpers support whole families, and gives officers a clear review queue.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="xl">
                <Link to="/login">
                  Try the demo
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="xl">
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-primary-foreground/60">
              <ShieldCheck className="size-4" aria-hidden />
              No real government systems connected. All records are synthetic.
            </p>
          </div>

          <HeroPreview />
        </section>
      </div>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-foreground">
            Built for everyone involved
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-primary sm:text-4xl">
            One platform, four kinds of users
          </h2>
          <Ur className="mt-2 text-xl text-muted-foreground">ایک پلیٹ فارم، سب کے لیے</Ur>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <article
              key={role.id}
              className="group flex flex-col rounded-3xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elegant"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <role.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-primary">{role.label}</h3>
              <Ur className="text-base text-muted-foreground">{role.urdu}</Ur>
              <p className="mt-2 flex-1 text-muted-foreground">{role.description}</p>
              {role.path ? (
                <Link
                  to={role.path}
                  className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:text-accent-foreground"
                >
                  Open demo dashboard <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <span className="mt-5 text-sm font-semibold text-muted-foreground">
                  Next stage
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-10 border-y bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-primary sm:text-4xl">How it works</h2>
              <Ur className="mt-2 text-xl text-muted-foreground">یہ کیسے کام کرتا ہے</Ur>
            </div>
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Languages className="size-5 text-accent-foreground" aria-hidden />
              English and Urdu, side by side
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl border bg-card p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gold-soft text-accent-foreground">
                    <step.icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-display text-5xl font-semibold text-border">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-primary">{step.title}</h3>
                <Ur className="text-base text-muted-foreground">{step.urdu}</Ur>
                <p className="mt-2 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-navy p-8 text-primary-foreground shadow-elegant sm:p-12">
          <div className="bg-pattern-grid absolute inset-0" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">See the prototype in action</h2>
              <Ur className="mt-2 text-xl text-primary-foreground/80">
                ڈیمو کردار منتخب کریں اور آزمائیں
              </Ur>
              <p className="mt-2 text-primary-foreground/70">
                Pick a demo role. No account or password needed.
              </p>
            </div>
            <Button asChild variant="gold" size="xl">
              <Link to="/login">
                Choose a demo role
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p className="max-w-xl">
            Sathi AI is a hackathon prototype. It is not affiliated with any government body,
            does not connect to official systems and uses only synthetic demo records.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gold/10 blur-2xl" />
      <div className="relative rounded-[2rem] border border-primary-foreground/15 bg-card p-5 text-card-foreground shadow-elegant">
        <div className="flex items-center gap-3 border-b pb-4">
          <span className="grid size-10 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground">
            S
          </span>
          <div>
            <p className="font-semibold text-primary">Sathi assistant</p>
            <p className="text-xs text-success">● Online · Demo</p>
          </div>
        </div>
        <div className="space-y-3 py-4">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
            <Ur className="text-base">میری درخواست کہاں تک پہنچی؟</Ur>
          </div>
          <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-secondary-foreground">
            Your Family Support Grant is <strong>in review</strong>. Step 2 of 4. An officer will
            decide within about 5 working days.
          </div>
          <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-gold/40 bg-gold-soft px-4 py-3">
            <div className="flex items-center justify-between text-sm font-semibold text-primary">
              <span>APP-DEMO-1021</span>
              <span className="text-warning">In review</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <span className="h-2 rounded-full bg-primary" />
              <span className="h-2 rounded-full bg-gold" />
              <span className="h-2 rounded-full bg-border" />
              <span className="h-2 rounded-full bg-border" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-background p-2">
          <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <Mic className="size-5" />
          </span>
          <span className="flex-1 px-1 text-sm text-muted-foreground">Ask anything…</span>
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Send className="size-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
