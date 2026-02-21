'use client';

import type { Task, TaskStatus } from '@/types/task';
import { TaskStatusBadge } from './task-status-badge';
import { TaskPriorityIndicator } from './task-priority-indicator';
import { TaskStatusSelect } from './task-status-select';

interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  statusChangeLoading?: boolean;
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isDueSoon(isoDate: string | null): boolean {
  if (!isoDate) return false;
  const diff = new Date(isoDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function isOverdue(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return new Date(isoDate).getTime() < Date.now();
}

export function TaskTable({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  statusChangeLoading,
}: TaskTableProps) {
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg
          className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No tasks found. Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Due Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Created
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {task.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  <TaskStatusBadge status={task.status} />
                  <TaskStatusSelect
                    taskId={task.id}
                    currentStatus={task.status}
                    onStatusChange={onStatusChange}
                    disabled={statusChangeLoading}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <TaskPriorityIndicator priority={task.priority} />
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-sm ${
                    isOverdue(task.dueDate)
                      ? 'font-medium text-red-600 dark:text-red-400'
                      : isDueSoon(task.dueDate)
                        ? 'font-medium text-yellow-600 dark:text-yellow-400'
                        : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {formatDate(task.dueDate)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(task.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(task)}
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    title="Edit task"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
