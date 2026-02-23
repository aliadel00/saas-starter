"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/types/notification";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

const TYPE_COLORS: Record<NotificationType, string> = {
  TASK_CREATED: "bg-blue-500",
  TASK_COMPLETED: "bg-green-500",
  TASK_UPDATED: "bg-amber-500",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function resolveActorLabel(
  actorEmail: string | null,
  currentUserEmail: string | undefined,
): string {
  if (!actorEmail) return "";
  if (currentUserEmail && actorEmail === currentUserEmail) return "You";
  return actorEmail;
}

function resolveBody(
  body: string,
  actorEmail: string | null,
  currentUserEmail: string | undefined,
): string {
  if (!actorEmail || !currentUserEmail) return body;
  if (actorEmail === currentUserEmail) {
    return body.replace(new RegExp(`by ${escapeRegex(actorEmail)}`, "gi"), "by you");
  }
  return body;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function PopoverItem({
  notification,
  currentUserEmail,
  onMarkRead,
  onClose,
}: {
  notification: Notification;
  currentUserEmail: string | undefined;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const dot = TYPE_COLORS[notification.type];
  const actor = resolveActorLabel(notification.actorEmail, currentUserEmail);
  const body = resolveBody(notification.body, notification.actorEmail, currentUserEmail);

  return (
    <div
      onClick={() => {
        if (notification.taskId) {
          onClose();
          router.push(`/tasks/${notification.taskId}`);
        }
      }}
      className={`flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
        notification.taskId ? "cursor-pointer" : ""
      } ${!notification.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {body}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          {actor && <span>{actor}</span>}
          {actor && <span>&middot;</span>}
          <span>{timeAgo(notification.createdAt)}</span>
        </div>
      </div>
      {!notification.read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="mt-1 shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          title="Mark as read"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useUnreadCount();
  const { notifications, loading } = useNotifications({ limit: 5 });
  const { markAllAsRead, loading: markingAll } = useMarkAllNotificationsAsRead();
  const { markAsRead } = useMarkNotificationAsRead();
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg border border-zinc-300 p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={markingAll}
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-zinc-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <svg
                  className="mb-2 h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
                <p className="text-xs font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <PopoverItem
                  key={n.id}
                  notification={n}
                  currentUserEmail={user?.email}
                  onMarkRead={markAsRead}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-zinc-50 dark:text-blue-400 dark:hover:bg-zinc-800/50"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
