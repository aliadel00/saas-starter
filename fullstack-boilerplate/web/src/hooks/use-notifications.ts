"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useState } from "react";
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  MARK_NOTIFICATION_AS_READ,
} from "@/graphql/notifications";
import type {
  GetNotificationsInput,
  PaginatedNotifications,
} from "@/types/notification";

export function useNotifications(initialInput?: GetNotificationsInput) {
  const [input, setInput] = useState<GetNotificationsInput>({
    page: 1,
    limit: 20,
    ...initialInput,
  });

  const { data, loading, error, refetch } = useQuery<{
    getNotifications: PaginatedNotifications;
  }>(GET_NOTIFICATIONS, {
    variables: { input },
    fetchPolicy: "cache-and-network",
    pollInterval: 10_000,
  });

  const setPage = useCallback((page: number) => {
    setInput((prev) => ({ ...prev, page }));
  }, []);

  const toggleUnreadOnly = useCallback(() => {
    setInput((prev) => ({
      ...prev,
      unreadOnly: !prev.unreadOnly,
      page: 1,
    }));
  }, []);

  return {
    notifications: data?.getNotifications.items ?? [],
    total: data?.getNotifications.total ?? 0,
    page: data?.getNotifications.page ?? 1,
    limit: data?.getNotifications.limit ?? 20,
    unreadCount: data?.getNotifications.unreadCount ?? 0,
    loading,
    error,
    input,
    setPage,
    toggleUnreadOnly,
    refetch,
  };
}

export function useUnreadCount() {
  const { data, loading } = useQuery<{ unreadNotificationCount: number }>(
    GET_UNREAD_COUNT,
    {
      fetchPolicy: "cache-and-network",
      pollInterval: 10_000,
    },
  );

  return {
    unreadCount: data?.unreadNotificationCount ?? 0,
    loading,
  };
}

export function useMarkNotificationAsRead() {
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [
      { query: GET_NOTIFICATIONS },
      { query: GET_UNREAD_COUNT },
    ],
  });

  const execute = useCallback(
    (id: string) => markAsRead({ variables: { id } }),
    [markAsRead],
  );

  return { markAsRead: execute };
}

export function useMarkAllNotificationsAsRead() {
  const [markAllAsRead, { loading }] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      refetchQueries: [
        { query: GET_NOTIFICATIONS },
        { query: GET_UNREAD_COUNT },
      ],
    },
  );

  const execute = useCallback(() => markAllAsRead(), [markAllAsRead]);

  return { markAllAsRead: execute, loading };
}
