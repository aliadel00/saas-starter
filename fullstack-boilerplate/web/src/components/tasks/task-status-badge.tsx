"use client";

import { TaskStatus } from "@/types/task";

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> =
  {
    [TaskStatus.TODO]: {
      label: "To Do",
      className:
        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    [TaskStatus.DONE]: {
      label: "Done",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
  };

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
