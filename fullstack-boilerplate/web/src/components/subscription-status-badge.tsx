"use client";

import { SubscriptionStatus } from "@/types/auth";

const STATUS_STYLES: Record<
  SubscriptionStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  [SubscriptionStatus.ACTIVE]: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Active",
  },
  [SubscriptionStatus.TRIALING]: {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    label: "Trialing",
  },
  [SubscriptionStatus.PAST_DUE]: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    label: "Past Due",
  },
  [SubscriptionStatus.CANCELED]: {
    bg: "bg-rose-50 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    label: "Canceled",
  },
  [SubscriptionStatus.INCOMPLETE]: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    label: "Incomplete",
  },
  [SubscriptionStatus.INCOMPLETE_EXPIRED]: {
    bg: "bg-rose-50 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    label: "Incomplete Expired",
  },
  [SubscriptionStatus.UNPAID]: {
    bg: "bg-rose-50 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    label: "Unpaid",
  },
};

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {style.label}
    </span>
  );
}
