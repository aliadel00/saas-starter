"use client";

import { TaskStatus } from "@/types/task";

interface TaskFiltersProps {
  currentStatus: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
}

const STATUS_OPTIONS: { value: TaskStatus | ""; label: string }[] = [
  { value: "", label: "All Tasks" },
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
];

export function TaskFilters({
  currentStatus,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="status-filter"
        className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
      >
        Status
      </label>
      <select
        id="status-filter"
        value={currentStatus ?? ""}
        onChange={(e) =>
          onStatusChange(
            e.target.value ? (e.target.value as TaskStatus) : undefined,
          )
        }
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
