'use client';

import { useEffect } from 'react';

interface DeleteConfirmModalProps {
  open: boolean;
  loading?: boolean;
  taskTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  open,
  loading,
  taskTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Delete Task
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-300">
          Are you sure you want to delete{' '}
          {taskTitle ? (
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              &ldquo;{taskTitle}&rdquo;
            </span>
          ) : (
            'this task'
          )}
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
