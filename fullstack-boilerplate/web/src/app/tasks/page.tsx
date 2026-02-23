"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskPagination } from "@/components/tasks/task-pagination";
import { TaskModal } from "@/components/tasks/task-modal";
import { DeleteConfirmModal } from "@/components/tasks/delete-confirm-modal";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";
import {
  useTasks,
  useChangeTaskStatus,
  useUpdateTask,
  useSoftDeleteTask,
} from "@/hooks/use-tasks";
import { useAuthContext } from "@/providers/auth-provider";
import type { Task, TaskStatus, UpdateTaskInput } from "@/types/task";

export default function TasksPage() {
  const { permissions } = useAuthContext();

  const {
    tasks,
    total,
    page,
    limit,
    loading,
    error,
    input,
    setPage,
    setStatus,
    refetch,
  } = useTasks();

  const { changeStatus, loading: statusLoading } = useChangeTaskStatus();
  const { updateTask, loading: updateLoading } = useUpdateTask();
  const { softDeleteTask, loading: deleteLoading } = useSoftDeleteTask();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleStatusChange = useCallback(
    (id: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === id);
      if (task) changeStatus(id, task, newStatus);
    },
    [tasks, changeStatus],
  );

  const handleSave = useCallback(
    async (id: string, data: UpdateTaskInput) => {
      await updateTask(id, data);
    },
    [updateTask],
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) setDeletingTask(task);
    },
    [tasks],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingTask) return;
    await softDeleteTask(deletingTask.id);
    setDeletingTask(null);
    refetch();
  }, [deletingTask, softDeleteTask, refetch]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage and track your team&apos;s work
          </p>
        </div>
        <div className="flex items-center gap-3">
          {permissions.taskLimitReached && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Upgrade Plan
            </button>
          )}
          {permissions.canCreateTask ? (
            <Link
              href="/tasks/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Task
            </Link>
          ) : (
            <span
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              title={
                permissions.planExpired
                  ? "Subscription expired"
                  : "Task limit reached"
              }
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Task
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error.message}
        </div>
      )}

      {permissions.planExpired && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Your subscription has expired. Please upgrade to continue creating tasks and users.
          {permissions.canChangePlan && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="ml-2 font-semibold underline hover:no-underline"
            >
              Upgrade now
            </button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <TaskFilters
            currentStatus={input.status}
            onStatusChange={setStatus}
          />
        </div>

        <TaskTable
          tasks={tasks}
          loading={loading}
          canDelete={permissions.canDeleteTask}
          canChangeStatus
          onEdit={setEditingTask}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
          statusChangeLoading={statusLoading}
        />

        <TaskPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <TaskModal
        task={editingTask}
        open={!!editingTask}
        loading={updateLoading}
        onClose={() => setEditingTask(null)}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        open={!!deletingTask}
        loading={deleteLoading}
        taskTitle={deletingTask?.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />

      <UpgradePlanModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
