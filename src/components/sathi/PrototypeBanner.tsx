import { FlaskConical } from "lucide-react";
import { Ur } from "./Ur";

export function PrototypeBanner() {
  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0 bg-gold-soft px-4 py-1.5 text-center text-sm font-medium text-accent-foreground"
    >
      <span className="inline-flex items-center gap-2">
        <FlaskConical className="size-4" aria-hidden />
        Hackathon prototype — synthetic demo data only. Not an official government service.
      </span>
      <Ur className="text-xs">پروٹوٹائپ — صرف فرضی ڈیٹا</Ur>
    </div>
  );
}
