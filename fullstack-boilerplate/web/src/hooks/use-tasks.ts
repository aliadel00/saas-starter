'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useState } from 'react';
import {
  GET_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  CHANGE_TASK_STATUS,
  SOFT_DELETE_TASK,
} from '@/graphql/tasks';
import type {
  Task,
  PaginatedTasks,
  GetTasksInput,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
} from '@/types/task';

export function useTasks(initialInput?: GetTasksInput) {
  const [input, setInput] = useState<GetTasksInput>({
    page: 1,
    limit: 10,
    ...initialInput,
  });

  const { data, loading, error, refetch } = useQuery<{
    getTasks: PaginatedTasks;
  }>(GET_TASKS, {
    variables: { input },
    fetchPolicy: 'cache-and-network',
  });

  const setPage = useCallback((page: number) => {
    setInput((prev) => ({ ...prev, page }));
  }, []);

  const setStatus = useCallback((status: TaskStatus | undefined) => {
    setInput((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  return {
    tasks: data?.getTasks.items ?? [],
    total: data?.getTasks.total ?? 0,
    page: data?.getTasks.page ?? 1,
    limit: data?.getTasks.limit ?? 10,
    loading,
    error,
    input,
    setPage,
    setStatus,
    refetch,
  };
}

export function useCreateTask() {
  const [createTask, { loading, error }] = useMutation<
    { createTask: Task },
    { input: CreateTaskInput }
  >(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const execute = useCallback(
    (input: CreateTaskInput) =>
      createTask({ variables: { input } }),
    [createTask],
  );

  return { createTask: execute, loading, error };
}

export function useUpdateTask() {
  const [updateTask, { loading, error }] = useMutation<
    { updateTask: Task },
    { id: string; input: UpdateTaskInput }
  >(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const execute = useCallback(
    (id: string, input: UpdateTaskInput) =>
      updateTask({ variables: { id, input } }),
    [updateTask],
  );

  return { updateTask: execute, loading, error };
}

export function useChangeTaskStatus() {
  const [changeStatus, { loading, error }] = useMutation<
    { changeTaskStatus: Task },
    { id: string; input: { status: TaskStatus } }
  >(CHANGE_TASK_STATUS);

  const execute = useCallback(
    (id: string, currentTask: Task, newStatus: TaskStatus) =>
      changeStatus({
        variables: { id, input: { status: newStatus } },
        optimisticResponse: {
          changeTaskStatus: {
            ...currentTask,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          },
        },
        update: (cache, { data }) => {
          if (!data) return;
          cache.modify({
            id: cache.identify(data.changeTaskStatus),
            fields: {
              status: () => newStatus,
            },
          });
        },
      }),
    [changeStatus],
  );

  return { changeStatus: execute, loading, error };
}

export function useSoftDeleteTask() {
  const [softDelete, { loading, error }] = useMutation<
    { softDeleteTask: Task },
    { id: string }
  >(SOFT_DELETE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
  });

  const execute = useCallback(
    (id: string) => softDelete({ variables: { id } }),
    [softDelete],
  );

  return { softDeleteTask: execute, loading, error };
}
