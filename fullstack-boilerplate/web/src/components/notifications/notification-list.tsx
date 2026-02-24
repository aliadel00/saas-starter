"use client";

import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/types/notification";
import { useMarkNotificationAsRead } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

const TYPE_STYLES: Record<NotificationType, { bg: string; text: string }> = {
  TASK_CREATED: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  TASK_COMPLETED: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
  },
  TASK_UPDATED: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
  },
  TASK_PRIORITY_CHANGED: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
  },
  USER_ADDED: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  USER_DELETED: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
  },
  USER_PASSWORD_CHANGED: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
  },
};

function formatLabel(type: NotificationType): string {
  return type.replace(/_/g, " ");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ResolvedBody {
  main: string;
  changes: string[];
}

function resolveBody(
  body: string,
  actorEmail: string | null,
  currentUserEmail: string | undefined,
): ResolvedBody {
  let resolved = body;
  if (actorEmail && currentUserEmail && actorEmail === currentUserEmail) {
    resolved = body.replace(new RegExp(`by ${escapeRegex(actorEmail)}`, "gi"), "by you");
  }

  const [main, changesPart] = resolved.split(" — ");
  const changes = changesPart ? changesPart.split(", ") : [];
  return { main, changes };
}

function resolveActorLabel(
  actorEmail: string | null,
  currentUserEmail: string | undefined,
): string | null {
  if (!actorEmail) return null;
  if (currentUserEmail && actorEmail === currentUserEmail) return "You";
  return actorEmail;
}

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

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
}

export function NotificationList({
  notifications,
  loading,
}: NotificationListProps) {
  const { markAsRead } = useMarkNotificationAsRead();
  const { user } = useAuth();
  const router = useRouter();

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-zinc-400">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
        <svg
          className="mb-3 h-10 w-10"
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
        <p className="text-sm font-medium">No notifications yet</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {notifications.map((n) => {
        const style = TYPE_STYLES[n.type];
        const dashboardScopedType =
          n.type === "USER_ADDED" ||
          n.type === "USER_DELETED" ||
          n.type === "USER_PASSWORD_CHANGED";
        return (
          <li
            key={n.id}
            onClick={() => {
              if (n.taskId) router.push(`/tasks/${n.taskId}`);
              if (!n.taskId && dashboardScopedType) router.push("/dashboard");
            }}
            className={`flex items-start gap-3 px-4 py-3 transition-colors ${
              n.taskId || dashboardScopedType ? "cursor-pointer" : ""
            } ${
              !n.read
                ? "bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
                : "bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${style.bg} ${style.text}`}
                >
                  {formatLabel(n.type)}
                </span>
                <span className="text-xs text-zinc-400">
                  {timeAgo(n.createdAt)}
                </span>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {n.title}
              </p>
              {(() => {
                const { main, changes } = resolveBody(n.body, n.actorEmail, user?.email);
                return (
                  <>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{main}</p>
                    {changes.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 text-xs text-zinc-500 dark:text-zinc-400">
                        {changes.map((c, i) => (
                          <li key={i} className="py-0.5">{c}</li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}
              {n.actorEmail && (
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  By {resolveActorLabel(n.actorEmail, user?.email)}
                </p>
              )}
            </div>
            {!n.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n.id);
                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                Mark read
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
