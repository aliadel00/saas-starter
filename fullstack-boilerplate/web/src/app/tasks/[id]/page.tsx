"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTask, useChangeTaskStatus, useUpdateTask } from "@/hooks/use-tasks";
import { useAuthContext } from "@/providers/auth-provider";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskPriorityIndicator } from "@/components/tasks/task-priority-indicator";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import { TaskModal } from "@/components/tasks/task-modal";
import type { Task, TaskStatus, UpdateTaskInput } from "@/types/task";
import { useCallback, useState } from "react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isDueSoon(iso: string | null): boolean {
  if (!iso) return false;
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const { task, loading, error } = useTask(params.id);
  const { changeStatus, loading: statusLoading } = useChangeTaskStatus();
  const { updateTask, loading: updateLoading } = useUpdateTask();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleStatusChange = useCallback(
    (_id: string, newStatus: TaskStatus) => {
      if (task) changeStatus(task.id, task, newStatus);
    },
    [task, changeStatus],
  );

  const handleSave = useCallback(
    async (id: string, data: UpdateTaskInput) => {
      await updateTask(id, data);
    },
    [updateTask],
  );

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400">{error.message}</p>
        <button
          onClick={() => router.push("/tasks")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Task not found.</p>
        <Link href="/tasks" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
          Back to Tasks
        </Link>
      </div>
    );
  }

  const dueDateColor = isOverdue(task.dueDate)
    ? "text-red-600 dark:text-red-400"
    : isDueSoon(task.dueDate)
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-zinc-700 dark:text-zinc-300";

  return (
    <>
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-5 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityIndicator priority={task.priority} />
          </div>
          <div className="flex items-center gap-2">
            {user && task.status !== "DONE" && (
              <TaskStatusSelect
                taskId={task.id}
                currentStatus={task.status}
                onStatusChange={handleStatusChange}
                disabled={statusLoading}
              />
            )}
            <button
              onClick={() => setEditingTask(task)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Title & description */}
        <div className="border-b border-zinc-100 px-6 py-6 dark:border-zinc-800">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {task.title}
          </h1>
          {task.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-zinc-400 dark:text-zinc-500">
              No description provided.
            </p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-px bg-zinc-100 dark:bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCell label="Status">
            <TaskStatusBadge status={task.status} />
          </DetailCell>
          <DetailCell label="Priority">
            <TaskPriorityIndicator priority={task.priority} />
          </DetailCell>
          <DetailCell label="Due Date">
            <span className={`text-sm font-medium ${dueDateColor}`}>
              {formatDate(task.dueDate)}
              {isOverdue(task.dueDate) && (
                <span className="ml-1.5 text-xs font-normal text-red-500">(overdue)</span>
              )}
              {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && (
                <span className="ml-1.5 text-xs font-normal text-yellow-500">(due soon)</span>
              )}
            </span>
          </DetailCell>
          <DetailCell label="Created By">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {task.createdBy === user?.id ? "You" : task.createdBy}
            </span>
          </DetailCell>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap gap-6 border-t border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Created
            </span>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDateTime(task.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Last Updated
            </span>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDateTime(task.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <TaskModal
        task={editingTask}
        open={!!editingTask}
        loading={updateLoading}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
      />
    </>
  );
}

function DetailCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white px-6 py-4 dark:bg-zinc-900">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
