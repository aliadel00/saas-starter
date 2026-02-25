"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { RoleBadge } from "@/components/role-badge";
import { MembersSection } from "@/components/members/members-section";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionPlan, type Role } from "@/types/auth";

function DashboardContent() {
  const { user, tenant, usage, permissions } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledUpgradeSignalRef = useRef<string | null>(null);
  const openFromQuery = searchParams.get("upgrade") === "true";
  const modalOpen = showUpgradeModal || openFromQuery;

  useEffect(() => {
    if (!openFromQuery) return;

    const source = searchParams.get("source");
    const signal = `upgrade:true|source:${source ?? "none"}`;
    if (handledUpgradeSignalRef.current === signal) return;

    handledUpgradeSignalRef.current = signal;
    if (source === "limit-users") {
      toast.error("User limit reached. Upgrade your plan to continue.");
    } else if (source === "limit-tasks") {
      toast.error("Task limit reached. Upgrade your plan to continue.");
    } else if (source === "plan-changed") {
      toast.success("Your plan changed. Review billing details.");
    }
  }, [openFromQuery, searchParams]);

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);

    if (!openFromQuery) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("upgrade");
    nextParams.delete("source");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `/dashboard?${nextQuery}` : "/dashboard");
  }, [openFromQuery, router, searchParams]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h2>
            {user && (
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                    Email
                  </dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                    Role
                  </dt>
                  <dd className="mt-1">
                    <RoleBadge role={user.role as Role} />
                  </dd>
                </div>
                {tenant && (
                  <div>
                    <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                      Organization
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                      {tenant.name}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            <div className="mt-6">
              <Link
                href="/tasks"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Go to Tasks
              </Link>
            </div>
          </div>

          {tenant && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  Subscription
                </h2>
                <SubscriptionBadge plan={tenant.plan as SubscriptionPlan} />
              </div>
              {usage && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Users
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {usage.userCount} /{" "}
                        {tenant.maxUsers === -1 ? "Unlimited" : tenant.maxUsers}
                      </span>
                    </div>
                    {tenant.maxUsers !== -1 && (
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usage.userCount >= tenant.maxUsers
                              ? "bg-red-500"
                              : usage.userCount >= tenant.maxUsers * 0.8
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min((usage.userCount / tenant.maxUsers) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Tasks
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {usage.taskCount} /{" "}
                        {tenant.maxTasks === -1 ? "Unlimited" : tenant.maxTasks}
                      </span>
                    </div>
                    {tenant.maxTasks !== -1 && (
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usage.taskCount >= tenant.maxTasks
                              ? "bg-red-500"
                              : usage.taskCount >= tenant.maxTasks * 0.8
                                ? "bg-amber-500"
                                : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min((usage.taskCount / tenant.maxTasks) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {permissions.canChangePlan &&
                tenant.plan !== SubscriptionPlan.ENTERPRISE && (
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Upgrade Plan
                  </button>
                )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <MembersSection
            title="Current Admins & Members"
            description="See who has access and create new admins or members."
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        </div>
        <UpgradePlanModal
          open={modalOpen}
          onClose={closeUpgradeModal}
        />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
