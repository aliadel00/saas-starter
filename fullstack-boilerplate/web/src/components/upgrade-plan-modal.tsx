"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { CREATE_CHECKOUT_SESSION_MUTATION } from "@/graphql/mutations";
import { SubscriptionPlan } from "@/types/auth";
import { useAuthContext } from "@/providers/auth-provider";

interface UpgradePlanModalProps {
  open: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    plan: SubscriptionPlan.FREE,
    label: "Free",
    price: "$0/mo",
    features: ["3 users", "10 tasks", "Basic support"],
  },
  {
    plan: SubscriptionPlan.PRO,
    label: "Pro",
    price: "$29/mo",
    features: ["20 users", "500 tasks", "Priority support", "Advanced analytics"],
  },
  {
    plan: SubscriptionPlan.ENTERPRISE,
    label: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited users",
      "Unlimited tasks",
      "Dedicated support",
      "SSO & audit logs",
    ],
  },
];

const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.PRO]: 1,
  [SubscriptionPlan.ENTERPRISE]: 2,
};

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  const { tenant } = useAuthContext();
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);

  const [createCheckout, { loading }] = useMutation(
    CREATE_CHECKOUT_SESSION_MUTATION,
    {
      onCompleted: (data) => {
        const url = data?.createCheckoutSession?.url as string | undefined;
        if (!url) {
          toast.error("Failed to create checkout session");
          return;
        }
        window.location.assign(url);
        onClose();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    },
  );

  const handleUpgrade = useCallback(() => {
    if (!selected) return;
    createCheckout({ variables: { plan: selected } });
  }, [selected, createCheckout]);

  const availablePlans = PLANS.filter((planOption) => {
    if (!tenant) return false;
    return planOption.plan !== tenant.plan;
  });

  const actionLabel = (() => {
    if (!tenant || !selected) return "Confirm";
    return PLAN_ORDER[selected] > PLAN_ORDER[tenant.plan]
      ? "Confirm Upgrade"
      : "Confirm Downgrade";
  })();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Change Your Plan
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {availablePlans.map(({ plan, label, price, features }) => {
            const isCurrent = tenant?.plan === plan;
            const isSelected = selected === plan;
            const isUpgrade =
              !!tenant && PLAN_ORDER[plan] > PLAN_ORDER[tenant.plan];
            return (
              <button
                key={plan}
                type="button"
                onClick={() => !isCurrent && setSelected(plan)}
                disabled={isCurrent}
                className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                    : isCurrent
                      ? "border-zinc-300 bg-zinc-50 opacity-60 dark:border-zinc-600 dark:bg-zinc-800"
                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                }`}
              >
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {label}
                </span>
                <span className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {price}
                </span>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isUpgrade
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isUpgrade ? "Upgrade" : "Downgrade"}
                </span>
                {isCurrent && (
                  <span className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                    Current plan
                  </span>
                )}
                <ul className="mt-4 space-y-1.5">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <svg
                        className="h-4 w-4 shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={!selected || loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
