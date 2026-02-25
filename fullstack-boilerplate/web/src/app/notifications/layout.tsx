"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";

function NotificationsLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NotificationsLayoutShell>{children}</NotificationsLayoutShell>
    </ProtectedRoute>
  );
}
