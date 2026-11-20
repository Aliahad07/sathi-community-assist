import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Urdu text span: sets lang/dir so the Nastaliq font and right-to-left flow apply. */
export function Ur({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span lang="ur" dir="rtl" className={cn("inline-block text-left", className)}>
      {children}
    </span>
  );
}
