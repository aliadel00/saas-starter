"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskPagination } from "@/components/tasks/task-pagination";
import { TaskModal } from "@/components/tasks/task-modal";
import { DeleteConfirmModal } from "@/components/tasks/delete-confirm-modal";
import {
  useTasks,
  useChangeTaskStatus,
  useUpdateTask,
  useSoftDeleteTask,
} from "@/hooks/use-tasks";
import { useAuthContext } from "@/providers/auth-provider";
import type { Task, TaskStatus, UpdateTaskInput } from "@/types/task";

export default function TasksPage() {
  const { user } = useAuthContext();
  const canDelete = user?.role === "ADMIN";
  const canChangeStatus = !!user;

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
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error.message}
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
          canDelete={canDelete}
          canChangeStatus={canChangeStatus}
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
    </>
  );
}
