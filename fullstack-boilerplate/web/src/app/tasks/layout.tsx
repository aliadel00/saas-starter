'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

function TasksLayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Dashboard
            </Link>
            <Link
              href="/tasks"
              className={`text-sm font-medium transition-colors ${
                pathname === '/tasks'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100'
              }`}
            >
              Tasks
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </span>
            )}
            <ThemeToggle />
            <button
              onClick={logout}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TasksLayoutShell>{children}</TasksLayoutShell>
    </ProtectedRoute>
  );
}
