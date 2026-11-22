
import {
  HandHeart,
  Landmark,
  ShieldCheck,
  UserRound,
  Eye,
  type LucideIcon,
} from "lucide-react";

export type RoleId =
  | "citizen"
  | "helper"
  | "officer"
  | "admin"
  | "auditor";

export interface RoleInfo {
  id: RoleId;
  label: string;
  urdu: string;
  description: string;
  path: "/citizen" | "/helper" | "/officer" | "/admin" | "/auditor";
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
    description: "Manage users, applications, rules and platform oversight.",
    path: "/admin",
    icon: ShieldCheck,
  },
  {
    id: "auditor",
    label: "Auditor",
    urdu: "آڈیٹر",
    description: "Inspect audit trails, AI decisions and consent records.",
    path: "/auditor",
    icon: Eye,
  },
];

export function getRole(id: RoleId): RoleInfo {
  const role = roles.find((r) => r.id === id);

  if (!role) {
    throw new Error(`Unknown role: ${id}`);
  }

  return role;
}
