"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AppHeader } from "@/components/app-header";
import { MembersSection } from "@/components/members/members-section";

function MembersContent() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <MembersSection
          title="Current Admins & Members"
          description="View everyone in your workspace and add new admins or members."
          onUpgradeClick={() => window.location.assign("/billing")}
        />
      </main>
    </div>
  );
}

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <MembersContent />
    </ProtectedRoute>
  );
}
