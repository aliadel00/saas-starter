"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  GET_TASKS,
  GET_TASK_BY_ID,
  CREATE_TASK,
  UPDATE_TASK,
  CHANGE_TASK_STATUS,
  SOFT_DELETE_TASK,
} from "@/graphql/tasks";
import { GET_NOTIFICATIONS, GET_UNREAD_COUNT } from "@/graphql/notifications";
import type {
  Task,
  PaginatedTasks,
  GetTasksInput,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
} from "@/types/task";

export function useTask(id: string) {
  const { data, loading, error } = useQuery<{ getTaskById: Task }>(
    GET_TASK_BY_ID,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: "cache-and-network",
    },
  );

  return {
    task: data?.getTaskById ?? null,
    loading,
    error,
  };
}

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
    fetchPolicy: "cache-and-network",
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
    refetchQueries: [
      { query: GET_TASKS },
      { query: GET_NOTIFICATIONS },
      { query: GET_UNREAD_COUNT },
    ],
    onCompleted: (data) => {
      toast.success(`Task "${data.createTask.title}" created`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const execute = useCallback(
    (input: CreateTaskInput) => createTask({ variables: { input } }),
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
  >(CHANGE_TASK_STATUS, {
    refetchQueries: [{ query: GET_NOTIFICATIONS }, { query: GET_UNREAD_COUNT }],
    onCompleted: (data) => {
      const task = data.changeTaskStatus;
      const labels: Record<string, string> = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        DONE: "Done",
      };
      const label = labels[task.status] ?? task.status;
      toast.success(`Task "${task.title}" moved to ${label}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id: cache.identify(data.changeTaskStatus as any),
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
