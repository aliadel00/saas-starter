export enum NotificationType {
  TASK_CREATED = "TASK_CREATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_UPDATED = "TASK_UPDATED",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  userId: string;
  tenantId: string;
  taskId: string | null;
  jobId: string | null;
  actorEmail: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export interface GetNotificationsInput {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}
