
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FilePlus2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";

interface ApplicationRecord {
  id: string;
  application_type: string;
  description: string;
  status: string;
  created_at: string;
}

export function RealApplicationPanel() {
  const [familyName, setFamilyName] = useState("");
  const [applicationType, setApplicationType] = useState("Financial Assistance");
  const [description, setDescription] = useState("");

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = getSupabase();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in to view your applications.");

      // Find families created by the currently logged-in citizen.
      const { data: families, error: familyError } = await supabase
        .from("families")
        .select("id")
        .eq("created_by", user.id);

      if (familyError) throw familyError;

      const familyIds = (families ?? []).map((family) => family.id);

      if (familyIds.length === 0) {
        setApplications([]);
        return;
      }

      // RLS ensures the citizen can only see applications they are allowed to access.
      const { data, error: applicationError } = await supabase
        .from("applications")
        .select("id, application_type, description, status, created_at")
        .in("family_id", familyIds)
        .order("created_at", { ascending: false });

      if (applicationError) throw applicationError;

      setApplications((data ?? []) as ApplicationRecord[]);
    } catch (err) {
      console.error("Application loading failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanFamilyName = familyName.trim();
    const cleanDescription = description.trim();

    if (!cleanFamilyName || !cleanDescription) {
      setError("Please complete all fields.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = getSupabase();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in before submitting.");

      // Step 1: Create a family owned by the logged-in citizen.
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({
          display_name: cleanFamilyName,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (familyError) throw familyError;

      // Step 2: Create the application under that family.
      // The database assigns the default status: pending.
      const { error: applicationError } = await supabase
        .from("applications")
        .insert({
          family_id: family.id,
          application_type: applicationType,
          description: cleanDescription,
        });

      if (applicationError) throw applicationError;

      setFamilyName("");
      setDescription("");
      setSuccess(
        "Your application has been submitted successfully."
      );

      await loadApplications();
    } catch (err) {
      console.error("Application submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Application submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="real-applications"
      className="scroll-mt-28 space-y-5 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FilePlus2 className="size-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Submit a real application
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your application will be saved in the SATHI AI database.
          </p>
        </div>

        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-foreground">
          Supabase connected
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="sathi-family-name"
            className="text-sm font-medium text-foreground"
          >
            Family name
          </label>

          <input
            id="sathi-family-name"
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            placeholder="Example: Ahmed Family"
            maxLength={100}
            required
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sathi-application-type"
            className="text-sm font-medium text-foreground"
          >
            Application type
          </label>

          <select
            id="sathi-application-type"
            value={applicationType}
            onChange={(event) => setApplicationType(event.target.value)}
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Financial Assistance</option>
            <option>Widow Support</option>
            <option>Emergency Relief</option>
            <option>Food Assistance</option>
            <option>Other Support</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sathi-description"
            className="text-sm font-medium text-foreground"
          >
            Describe your situation
          </label>

          <textarea
            id="sathi-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain why you need assistance..."
            rows={4}
            maxLength={2000}
            required
            className="w-full resize-y rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Maximum 2,000 characters. Use synthetic information for the hackathon demo.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-success/30 bg-success-soft p-3 text-sm text-foreground"
          >
            {success}
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          <FilePlus2 />
          {submitting ? "Submitting..." : "Submit application"}
        </Button>
      </form>

      <div className="border-t pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">
            Applications from database
          </h3>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void loadApplications()}
          >
            <RefreshCw />
            Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading applications...
          </p>
        ) : applications.length === 0 ? (
          <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            No applications found. Submit your first application above.
          </p>
        ) : (
          <ul className="space-y-3">
            {applications.map((application) => (
              <li
                key={application.id}
                className="rounded-xl border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {application.application_type}
                  </p>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-foreground">
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {application.description}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Reference: {application.id}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted:{" "}
                  {new Date(application.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
