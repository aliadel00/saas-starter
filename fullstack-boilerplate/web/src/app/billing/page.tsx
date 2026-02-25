"use client";

import { useEffect, useMemo } from "react";
import { useMutation } from "@apollo/client";
import toast from "react-hot-toast";
import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { SubscriptionStatusBadge } from "@/components/subscription-status-badge";
import { CREATE_CHECKOUT_SESSION_MUTATION } from "@/graphql/mutations";
import { MY_TENANT_QUERY, TENANT_USAGE_QUERY } from "@/graphql/queries";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/auth";

const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: "Free",
  [SubscriptionPlan.PRO]: "Pro",
  [SubscriptionPlan.ENTERPRISE]: "Enterprise",
};

type BillingAction = {
  label: string;
  targetPlan: SubscriptionPlan;
  kind: "upgrade" | "downgrade" | "renew";
};

function BillingContent() {
  const { tenant, usage, user, refreshUsage } = useAuth();

  const [createCheckoutSession, { loading }] = useMutation(
    CREATE_CHECKOUT_SESSION_MUTATION,
    {
      refetchQueries: [{ query: MY_TENANT_QUERY }, { query: TENANT_USAGE_QUERY }],
      onError: (error) => toast.error(error.message),
    },
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    let cancelled = false;

    if (checkout === "success") {
      toast.success("Payment completed. Refreshing subscription...");
      void (async () => {
        // Webhook processing can lag behind redirect by a few seconds.
        for (let attempt = 0; attempt < 5; attempt += 1) {
          if (cancelled) return;
          await refreshUsage();
          if (attempt < 4) {
            await new Promise((resolve) => {
              window.setTimeout(resolve, 1500);
            });
          }
        }
      })();
    } else if (checkout === "cancel") {
      toast.error("Checkout canceled.");
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState({}, "", nextUrl);

    return () => {
      cancelled = true;
    };
  }, [refreshUsage]);

  const isInactive = useMemo(() => {
    if (!tenant) return false;
    return !(
      tenant.subscriptionStatus === SubscriptionStatus.ACTIVE ||
      tenant.subscriptionStatus === SubscriptionStatus.TRIALING
    );
  }, [tenant]);

  const renewalDate = tenant?.expiresAt ? new Date(tenant.expiresAt) : null;

  const runCheckout = async (plan: SubscriptionPlan) => {
    const response = await createCheckoutSession({ variables: { plan } });
    const url = response.data?.createCheckoutSession?.url as string | undefined;
    if (!url) {
      toast.error("Failed to create checkout session.");
      return;
    }
    window.location.assign(url);
  };

  const actions = useMemo<BillingAction[]>(() => {
    if (!tenant) return [];
    const isActiveSubscription =
      tenant.subscriptionStatus === SubscriptionStatus.ACTIVE ||
      tenant.subscriptionStatus === SubscriptionStatus.TRIALING;
    const renewalAction: BillingAction[] =
      !isActiveSubscription && tenant.plan !== SubscriptionPlan.FREE
        ? [
            {
              label: `Renew ${PLAN_LABEL[tenant.plan]}`,
              targetPlan: tenant.plan,
              kind: "renew",
            },
          ]
        : [];

    if (tenant.plan === SubscriptionPlan.FREE) {
      return [
        {
          label: "Upgrade to Pro",
          targetPlan: SubscriptionPlan.PRO,
          kind: "upgrade",
        },
        {
          label: "Upgrade to Enterprise",
          targetPlan: SubscriptionPlan.ENTERPRISE,
          kind: "upgrade",
        },
      ];
    }

    if (tenant.plan === SubscriptionPlan.PRO) {
      return [
        ...renewalAction,
        {
          label: "Downgrade to Free",
          targetPlan: SubscriptionPlan.FREE,
          kind: "downgrade",
        },
        {
          label: "Upgrade to Enterprise",
          targetPlan: SubscriptionPlan.ENTERPRISE,
          kind: "upgrade",
        },
      ];
    }

    return [
      ...renewalAction,
      {
        label: "Downgrade to Pro",
        targetPlan: SubscriptionPlan.PRO,
        kind: "downgrade",
      },
      {
        label: "Downgrade to Free",
        targetPlan: SubscriptionPlan.FREE,
        kind: "downgrade",
      },
    ];
  }, [tenant]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Billing
            </h1>
            {tenant && (
              <div className="flex items-center gap-2">
                <SubscriptionBadge plan={tenant.plan} />
                <SubscriptionStatusBadge status={tenant.subscriptionStatus} />
              </div>
            )}
          </div>

          {isInactive && tenant && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Your subscription is {tenant.subscriptionStatus.toLowerCase()}. Some
              features are blocked until billing is active again.
            </div>
          )}

          {tenant && usage && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Plan
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {PLAN_LABEL[tenant.plan]}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Renewal Date
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {renewalDate ? renewalDate.toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Users
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {usage.userCount} /{" "}
                  {tenant.maxUsers === -1 ? "Unlimited" : tenant.maxUsers}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Tasks
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {usage.taskCount} /{" "}
                  {tenant.maxTasks === -1 ? "Unlimited" : tenant.maxTasks}
                </p>
              </div>
            </div>
          )}

          {user?.role === "OWNER" && tenant && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => runCheckout(action.targetPlan)}
                  disabled={loading}
                  className={
                    action.kind === "upgrade" || action.kind === "renew"
                      ? "rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                      : "rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}
