"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";

function TasksLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <TasksLayoutShell>{children}</TasksLayoutShell>
    </ProtectedRoute>
  );
}
