
import { RealApplicationPanel } from "@/components/sathi/RealApplicationPanel";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Bot,
  FileText,
  FileUp,
  FolderOpen,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  Phone,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DashboardShell, type ShellNavItem } from "@/components/sathi/DashboardShell";
import { Section } from "@/components/sathi/Section";
import { DemoBadge, StatusBadge } from "@/components/sathi/StatusBadge";
import { Ur } from "@/components/sathi/Ur";

import {
  applicationSteps,
  assistantSuggestions,
  demoCitizen,
  demoHelper,
  docStatusMeta,
} from "@/lib/mock-data";

import { demoActions, useDemoStore } from "@/lib/demo-store";
import { formatDateTime, stepFor, welcomeSummary } from "@/lib/demo-workflow";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "Citizen dashboard — Sathi AI Prototype" },
      {
        name: "description",
        content: "Citizen dashboard: track applications, manage documents and ask Sathi in English or Urdu.",
      },
      { property: "og:title", content: "Citizen dashboard — Sathi AI Prototype" },
      {
        property: "og:description",
        content: "See how citizens track requests and get guidance in the Sathi AI demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CitizenDashboard,
});

const nav: ShellNavItem[] = [
  { id: "overview", label: "Overview", urdu: "جائزہ", icon: LayoutGrid },
  { id: "assistant", label: "Ask Sathi", urdu: "ساتھی سے پوچھیں", icon: Bot },
  { id: "applications", label: "My applications", urdu: "میری درخواستیں", icon: FileText },
  { id: "documents", label: "My documents", urdu: "میرے کاغذات", icon: FolderOpen },
  { id: "help", label: "Get help", urdu: "مدد حاصل کریں", icon: LifeBuoy },
];

function CitizenDashboard() {
  const store = useDemoStore();

  const [profileName, setProfileName] = useState("Citizen");
  const [profileEmail, setProfileEmail] = useState("");

  const [uploadFor, setUploadFor] = useState<string | null>(null);

  // Existing sample applications are still demo data.
  const applications = store.applications.filter(
    (a) => a.citizenId === demoCitizen.citizenId
  );

  const documents = store.documents;

  // Load the currently authenticated user's real Supabase profile.
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = getSupabase();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Authentication error:", authError.message);
          return;
        }

        if (!user) {
          console.error("No authenticated user found.");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        if (profileError) {
          console.error("Profile loading error:", profileError.message);
        }

        const actualName =
          profile?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Citizen";

        setProfileName(actualName);
        setProfileEmail(user.email || "");
      } catch (error) {
        console.error("Unable to load citizen profile:", error);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const returnedApps = applications.filter(
    (a) => a.status === "returned"
  );

  const uploadTarget = applications.find(
    (a) => a.id === uploadFor
  );

  function handleDocumentSubmitted(fileName: string) {
    if (!uploadFor) return;

    demoActions.submitDocument(uploadFor, fileName);

    toast.success("Document uploaded successfully (Demo Only).", {
      description:
        "Only the file name was saved in this browser — the file was not sent anywhere.",
    });
  }

  return (
    <DashboardShell
      role="citizen"
      userName={profileName}
      userMeta={profileEmail || "Verified citizen"}
      nav={nav}
    >
      {/* Overview */}
      <section id="overview" className="scroll-mt-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-navy p-6 text-primary-foreground shadow-elegant sm:p-8">
          <div className="bg-pattern-grid absolute inset-0" aria-hidden />

          <div className="relative">
            <Ur className="text-xl text-gold">
              السلام علیکم
            </Ur>

            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
              Welcome, {profileName}
            </h1>

            <p className="mt-2 text-primary-foreground/75">
              {welcomeSummary(applications)}
            </p>
          </div>
        </div>

        {returnedApps.map((returned) => (
          <div
            key={returned.id}
            role="alert"
            className="mt-4 flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-danger-soft p-5 sm:flex-row sm:items-center"
          >
            <AlertCircle
              className="size-7 shrink-0 text-destructive"
              aria-hidden
            />

            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Action needed: {returned.service}
              </p>
              <p className="text-muted-foreground">
                {returned.note}
              </p>
            </div>

            <Button
              variant="destructive"
              size="lg"
              onClick={() => setUploadFor(returned.id)}
            >
              <Upload />
              Fix now
            </Button>
          </div>
        ))}

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {nav.slice(1).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex min-h-32 flex-col justify-between rounded-2xl border-2 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary sm:p-5"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <item.icon className="size-6" aria-hidden />
              </span>

              <span>
                <span className="block text-lg font-semibold text-foreground">
                  {item.label}
                </span>
                <Ur className="text-sm text-muted-foreground">
                  {item.urdu}
                </Ur>
              </span>
            </a>
          ))}
        </div>
      </section>

      <RealApplicationPanel />
      <Assistant />

      {/* Applications */}
      <Section
        id="applications"
        title="My applications"
        urdu="میری درخواستیں"
        action={<DemoBadge />}
      >
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {app.service}
                  </p>

                  <Ur className="text-sm text-muted-foreground">
                    {app.serviceUrdu}
                  </Ur>

                  <p className="text-sm text-muted-foreground">
                    {app.id} · {app.department} · Submitted {app.submitted}
                  </p>
                </div>

                <StatusBadge status={app.status} />
              </div>

              <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Progress">
                {applicationSteps.map((s, i) => {
                  const step = stepFor(app.status);
                  const done = i < step;
                  const isReturned =
                    app.status === "returned" && i === step - 1;

                  return (
                    <li key={s.label} className="flex flex-col gap-2">
                      <span
                        className={cn(
                          "h-2 rounded-full",
                          isReturned
                            ? "bg-destructive"
                            : done
                              ? "bg-primary"
                              : "bg-border"
                        )}
                      />

                      <span
                        className={cn(
                          "text-xs font-semibold sm:text-sm",
                          done
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {app.submission && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Document:{" "}
                  <span className="font-medium text-foreground">
                    {app.submission.fileName}
                  </span>{" "}
                  · uploaded {formatDateTime(app.submission.uploadedAt)} (demo)
                </p>
              )}

              {app.decision?.outcome === "approved" &&
                app.status === "approved" && (
                  <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-foreground">
                    Approved by {app.decision.officer} on{" "}
                    {formatDateTime(app.decision.decidedAt)} (demo)
                  </p>
                )}

              {app.note && (
                <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-destructive">
                  Officer note: {app.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* Documents */}
      <Section
        id="documents"
        title="My documents"
        urdu="میرے کاغذات"
        action={<DemoBadge />}
      >
        <ul className="divide-y rounded-2xl border">
          {documents.map((doc) => {
            const meta = docStatusMeta[doc.status];

            return (
              <li
                key={doc.name}
                className="flex flex-wrap items-center gap-4 p-4"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <FileText className="size-5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {doc.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    <Ur className="me-2">{doc.urdu}</Ur>
                    · Updated {doc.updated}
                    {doc.fileName && <> · {doc.fileName}</>}
                  </p>
                </div>

                <Badge variant={meta.variant}>
                  {meta.label}
                </Badge>

                {doc.status === "needs_update" && doc.applicationId && (
                  <Button
                    size="sm"
                    onClick={() => setUploadFor(doc.applicationId ?? null)}
                  >
                    <Upload />
                    Upload again
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Help */}
      <Section
        id="help"
        title="Get help"
        urdu="مدد حاصل کریں"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-gold-soft p-5">
            <p className="text-sm font-semibold text-accent-foreground">
              Your community helper
            </p>

            <p className="mt-1 text-xl font-semibold text-primary">
              {demoHelper.name}
            </p>

            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" aria-hidden />
              {demoHelper.area} · Tue & Thu
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm font-semibold text-muted-foreground">
              Demo helpline
            </p>

            <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-primary">
              <Phone className="size-5" aria-hidden />
              0000-000000
            </p>

            <p className="mt-1 text-muted-foreground">
              Placeholder number. Not a real service.
            </p>
          </div>
        </div>
      </Section>

      <UploadDialog
        open={uploadFor !== null}
        serviceName={uploadTarget?.service}
        onOpenChange={(open) => {
          if (!open) setUploadFor(null);
        }}
        onSubmitted={handleDocumentSubmitted}
      />
    </DashboardShell>
  );
}

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];

function UploadDialog({
  open,
  serviceName,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  serviceName: string | undefined;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (fileName: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function reset() {
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error("File type not supported", {
        description: "Please choose a JPG, JPEG, PNG or PDF file.",
      });

      e.target.value = "";
      return;
    }

    setFile(selected);
  }

  function handleSubmit() {
    if (!file) return;

    onSubmitted(file.name);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="grid-cols-[minmax(0,1fr)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Upload document{serviceName ? ` — ${serviceName}` : ""}
          </DialogTitle>

          <DialogDescription>
            <Ur className="block">
              دستاویز اپ لوڈ کریں
            </Ur>

            Choose a JPG, JPEG, PNG or PDF file. Demo only — your file stays on this device and is
            not sent to any government department or permanently stored.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Choose document file"
        />

        {file ? (
          <div className="space-y-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt={`Preview of ${file.name}`}
                className="max-h-56 w-full rounded-xl border object-contain bg-muted"
              />
            )}

            <div className="flex items-center gap-3 rounded-xl border bg-muted px-4 py-3">
              <FileText className="size-5 shrink-0 text-primary" aria-hidden />

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {file.name}
              </span>

              <Badge variant="gold">Demo</Badge>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/50 p-6 text-center transition-colors hover:border-primary"
          >
            <FileUp className="size-8 text-primary" aria-hidden />
            <span className="font-semibold text-foreground">
              Choose a file
            </span>
            <span className="text-sm text-muted-foreground">
              JPG, JPEG, PNG or PDF
            </span>
          </button>
        )}

        <DialogFooter className="gap-2 sm:flex-col-reverse sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 w-full whitespace-normal py-2"
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            {file ? "Choose a different file" : "Browse files"}
          </Button>

          <Button
            type="button"
            size="lg"
            className="h-auto min-h-11 w-full whitespace-normal py-2"
            disabled={!file}
            onClick={handleSubmit}
          >
            <FileUp />
            Submit Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ChatMessage {
  from: "user" | "sathi";
  text: string;
  urdu?: boolean;
}

function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "sathi",
      text: "Hello! I am Sathi. Ask me about your applications or documents. Tap a question below to start.",
    },
  ]);

  const [draft, setDraft] = useState("");

  function ask(question: string, answer: string, urdu = false) {
    setMessages((m) => [
      ...m,
      { from: "user", text: question, urdu },
      { from: "sathi", text: answer },
    ]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const q = draft.trim();
    if (!q) return;

    ask(
      q,
      "Thanks for your question. In this prototype I give sample answers only — try one of the suggested questions to see how Sathi guides you."
    );

    setDraft("");
  }

  return (
    <Section
      id="assistant"
      title="Ask Sathi"
      urdu="ساتھی سے پوچھیں"
      description="Demo assistant with pre-written answers. No AI service is connected yet."
    >
      <div
        className="max-h-96 space-y-3 overflow-y-auto rounded-2xl bg-muted p-4"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3",
              m.from === "user"
                ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                : "rounded-bl-md border bg-card text-card-foreground"
            )}
          >
            {m.urdu ? <Ur>{m.text}</Ur> : m.text}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {assistantSuggestions.map((s) => (
          <button
            key={s.q}
            type="button"
            onClick={() => ask(s.qUrdu, s.a, true)}
            className="rounded-2xl border-2 bg-card p-3 text-left transition-colors hover:border-primary"
          >
            <span className="block font-semibold text-foreground">
              {s.q}
            </span>

            <Ur className="text-sm text-muted-foreground">
              {s.qUrdu}
            </Ur>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor="ask-sathi" className="sr-only">
          Type your question
        </label>

        <Input
          id="ask-sathi"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your question / اپنا سوال لکھیں"
          className="h-12 rounded-xl text-base"
        />

        <Button type="submit" size="lg" aria-label="Send question">
          <Send />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </Section>
  );
}
