"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { useAuth } from "@/hooks/use-auth";

function DashboardContent() {
  const { user, tenant } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
                <dd className="font-medium text-zinc-900 dark:text-zinc-50">
                  {user.role}
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
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
