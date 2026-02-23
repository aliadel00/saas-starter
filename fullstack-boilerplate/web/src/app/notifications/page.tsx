"use client";

import { NotificationList } from "@/components/notifications/notification-list";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const {
    notifications,
    total,
    page,
    limit,
    unreadCount,
    loading,
    error,
    input,
    setPage,
    toggleUnreadOnly,
  } = useNotifications();

  const { markAllAsRead, loading: markingAll } =
    useMarkAllNotificationsAsRead();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleUnreadOnly}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              input.unreadOnly
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {input.unreadOnly ? "Show all" : "Unread only"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={markingAll}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error.message}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <NotificationList notifications={notifications} loading={loading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-zinc-600"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-zinc-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-zinc-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
