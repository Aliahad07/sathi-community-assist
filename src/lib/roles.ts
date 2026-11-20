import { HandHeart, Landmark, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";

export type RoleId = "citizen" | "helper" | "officer" | "admin";

export interface RoleInfo {
  id: RoleId;
  label: string;
  urdu: string;
  description: string;
  /** Dashboard path, or null when the role is not part of this prototype stage. */
  path: "/citizen" | "/helper" | "/officer" | null;
  icon: LucideIcon;
}

export const roles: RoleInfo[] = [
  {
    id: "citizen",
    label: "Citizen",
    urdu: "شہری",
    description: "Apply for services, track requests and ask Sathi for help.",
    path: "/citizen",
    icon: UserRound,
  },
  {
    id: "helper",
    label: "Community Helper",
    urdu: "کمیونٹی مددگار",
    description: "Support families in your area with their applications.",
    path: "/helper",
    icon: HandHeart,
  },
  {
    id: "officer",
    label: "Department Officer",
    urdu: "سرکاری افسر",
    description: "Review, approve or return citizen applications.",
    path: "/officer",
    icon: Landmark,
  },
  {
    id: "admin",
    label: "Administrator",
    urdu: "منتظم",
    description: "Platform settings and oversight. Coming in the next stage.",
    path: null,
    icon: ShieldCheck,
  },
];

export function getRole(id: RoleId): RoleInfo {
  const role = roles.find((r) => r.id === id);
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
}
