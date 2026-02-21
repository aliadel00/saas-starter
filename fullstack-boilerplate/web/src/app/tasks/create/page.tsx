'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { TaskForm } from '@/components/tasks/task-form';
import { useCreateTask } from '@/hooks/use-tasks';
import type { CreateTaskInput } from '@/types/task';

export default function CreateTaskPage() {
  const { createTask, loading, error } = useCreateTask();

  const handleSubmit = useCallback(
    async (input: CreateTaskInput) => {
      await createTask(input);
    },
    [createTask],
  );

  return (
    <>
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Create New Task
          </h1>
          <TaskForm
            onSubmit={handleSubmit}
            loading={loading}
            serverError={error?.message}
          />
        </div>
      </div>
    </>
  );
}
