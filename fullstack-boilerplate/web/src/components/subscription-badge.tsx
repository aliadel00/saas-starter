"use client";

import { SubscriptionPlan } from "@/types/auth";

const PLAN_STYLES: Record<
  SubscriptionPlan,
  { bg: string; text: string; border: string }
> = {
  [SubscriptionPlan.FREE]: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
  },
  [SubscriptionPlan.PRO]: {
    bg: "bg-violet-50 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
  [SubscriptionPlan.ENTERPRISE]: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
};

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: "Free",
  [SubscriptionPlan.PRO]: "Pro",
  [SubscriptionPlan.ENTERPRISE]: "Enterprise",
};

interface SubscriptionBadgeProps {
  plan: SubscriptionPlan;
}

export function SubscriptionBadge({ plan }: SubscriptionBadgeProps) {
  const style = PLAN_STYLES[plan];
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {PLAN_LABELS[plan]}
    </span>
  );
}
