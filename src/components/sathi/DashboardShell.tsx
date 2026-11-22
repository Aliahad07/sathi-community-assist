
import { useEffect, useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { getSupabase } from "@/lib/supabase";
import { Logo } from "@/components/sathi/Logo";
import { PrototypeBanner } from "@/components/sathi/PrototypeBanner";
import type { RoleId } from "@/lib/roles";

interface DashboardShellProps {
  role: RoleId;
  children: ReactNode;
}

const rolePaths: Record<string, string> = {
  citizen: "/citizen",
  helper: "/helper",
  officer: "/officer",
  auditor: "/auditor",
  admin: "/login",
};

export function DashboardShell({
  role,
  children,
}: DashboardShellProps) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const supabase = getSupabase();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          window.location.href = "/login";
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        const actualRole = profile?.role;

        if (actualRole !== role) {
          const destination =
            actualRole && rolePaths[actualRole]
              ? rolePaths[actualRole]
              : "/login";

          window.location.href = destination;
          return;
        }

        if (active) {
          setUserName(profile?.full_name ?? "User");
          setUserEmail(session.user.email ?? "");
          setLoading(false);
        }
      } catch (error) {
        console.error("Session verification failed:", error);

        if (active) {
          toast.error("Session verification failed. Please log in again.");
          window.location.href = "/login";
        }
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [role]);

  async function handleSignOut() {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Unable to sign out. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PrototypeBanner />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo />

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {role} account
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

