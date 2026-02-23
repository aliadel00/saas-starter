"use client";

import { Role } from "@/types/auth";

const ROLE_STYLES: Record<Role, { bg: string; text: string; border: string }> =
  {
    [Role.OWNER]: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
    },
    [Role.ADMIN]: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
    },
    [Role.MEMBER]: {
      bg: "bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-600 dark:text-zinc-400",
      border: "border-zinc-200 dark:border-zinc-700",
    },
  };

const ROLE_LABELS: Record<Role, string> = {
  [Role.OWNER]: "Owner",
  [Role.ADMIN]: "Admin",
  [Role.MEMBER]: "Member",
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_STYLES[role];
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text} ${style.border}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
