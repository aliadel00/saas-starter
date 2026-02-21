'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateTaskInput } from '@/types/task';

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  loading?: boolean;
  serverError?: string;
}

interface FormErrors {
  title?: string;
  priority?: string;
}

export function TaskForm({ onSubmit, loading, serverError }: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (priority < 1 || priority > 5) errs.priority = 'Priority must be between 1 and 5';
    return errs;
  }, [title, priority]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      try {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        });
        router.push('/tasks');
      } catch {
        // Error is displayed via serverError prop
      }
    },
    [title, description, priority, dueDate, validate, onSubmit, router],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          placeholder="Enter task title"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => {
              setPriority(Number(e.target.value));
              if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value={1}>1 - Lowest</option>
            <option value={2}>2 - Low</option>
            <option value={3}>3 - Medium</option>
            <option value={4}>4 - High</option>
            <option value={5}>5 - Critical</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority}</p>
          )}
        </div>

        <div>
          <label htmlFor="due-date" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Due Date
          </label>
          <input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/tasks')}
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
