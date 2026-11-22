import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/sathi/Logo";
import { PrototypeBanner } from "@/components/sathi/PrototypeBanner";
import { getSupabase } from "@/lib/supabase";
import { roles, type RoleId } from "@/lib/roles";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Sathi AI" },
      {
        name: "description",
        content: "Secure sign in to the Sathi AI public assistance prototype.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function openDashboard(userId: string) {
    const supabase = getSupabase();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Your user profile could not be loaded. Contact the administrator.");
    }

    const role = profile.role as RoleId;
    const roleInfo = roles.find((item) => item.id === role);

    if (!roleInfo || !roleInfo.path) {
      throw new Error("Your account role does not have an available dashboard yet.");
    }

    await navigate({ to: roleInfo.path });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signupError) throw signupError;

        if (!data.session) {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
          setMode("login");
          return;
        }

        await openDashboard(data.user.id);
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) throw loginError;
        if (!data.user) throw new Error("Login failed. Please try again.");

        await openDashboard(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PrototypeBanner />

      <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-navy p-12 text-primary-foreground lg:flex">
          <Logo tone="light" />

          <div>
            <h1 className="text-4xl font-semibold leading-tight">
              Welcome to Sathi.
              <br />
              <span className="text-gradient-gold">Assistance made accessible.</span>
            </h1>

            <p className="mt-5 max-w-md text-primary-foreground/75">
              A digital public assistance platform designed to help citizens access services,
              track applications and connect with community support.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-primary-foreground/80">
              <li>Secure account authentication</li>
              <li>Role-based access to dashboards</li>
              <li>Synthetic hackathon demonstration data</li>
            </ul>
          </div>

          <p className="text-sm text-primary-foreground/50">
            Hackathon prototype · Not an official government service
          </p>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Logo className="mb-8 lg:hidden" />

            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-accent-foreground">
              <FlaskConical className="size-4" />
              Secure account access
            </span>

            <h2 className="mt-5 text-3xl font-semibold text-primary">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue to your Sathi dashboard."
                : "Create a citizen account to get started."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {message && (
                <div role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                  {message}
                </div>
              )}

              <Button type="submit" size="xl" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
                {!loading && <ArrowRight />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Sathi?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline underline-offset-4"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                  setMessage("");
                }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Prototype only. Use synthetic information, not real government or personal records.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
